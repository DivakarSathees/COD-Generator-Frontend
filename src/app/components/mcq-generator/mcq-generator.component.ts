import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { McqServiceService } from '../../services/mcq-service.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MonacoEditorModule, MONACO_PATH, MonacoEditorComponent, MonacoEditorConstructionOptions, MonacoStandaloneCodeEditor } from '@materia-ui/ngx-monaco-editor';
import { editor, languages } from 'monaco-editor';

@Component({
  selector: 'app-mcq-generator',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, MonacoEditorModule],
	// providers: [{
	// 	provide: MONACO_PATH,
	// 	useValue: 'https://unpkg.com/monaco-editor@0.20.0/min/vs'
	// }],
  templateUrl: './mcq-generator.component.html',
  styleUrl: './mcq-generator.component.css'
})
export class McqGeneratorComponent implements OnInit {
  ngOnInit() {
   
  }
  mcqForm: FormGroup;
  mcqs: any[] = [];
  loading = false;
  verifing = false;
  uploading = false;
  codeOutput: string = '';
  error = '';
  outputerror = '';
  customPrompt = '';
  mode: 'form' | 'prompt' = 'form';
  language = '';
  token: any;
  // editorOptions = { theme: 'vs-dark', language: 'java' };
  editorOptions = {theme: 'vs-dark', language: 'csharp'};
  code: string= '';

  constructor(private fb: FormBuilder, private mcqService: McqServiceService) {
    this.mcqForm = this.fb.group({
      question_count: [5, Validators.required],
      options_count: [4, Validators.required],
      difficulty_level: ['Easy', Validators.required],
      code_snippet: [0, Validators.required],
      topic: ['', Validators.required],
      token: [''], // Token for authentication
      qb_id: [''], // Question bank ID
      createdBy: [''], // Creator's name or ID
      // codeOutput: [''], // Output for code execution
    });
  }

  getQuestionText(fullText: string): string {
    return fullText?.split('$$$examly')[0]?.trim() || '';
  }

  getCodeSnippet(fullText: string): string {
    return fullText?.split('$$$examly')[1]?.trim() || '';
  }

  combineQuestionAndCode(question: string, code: string, codeVisible: boolean): string {
    if (codeVisible) {
      return `${question}$$$examly${code}`;
    } else {
      return question;
    }
  }

  generateFromForm() {
    this.loading = true;
    this.error = '';
    const payload = this.mcqForm.value;

    this.mcqService.generateMcqs(payload).subscribe({
      // next: (res: any) => {
      //   this.mcqs = res.response;
      //   this.loading = false;
      // },
      // error: (err) => {
      //   this.error = 'Something went wrong';
      //   this.loading = false;
      // },
      next: (res: any) => {
      this.mcqs = res.response.map((mcq: any) => ({
          ...mcq,
          questionText: this.getQuestionText(mcq.question_data),
          codeSnippet: this.getCodeSnippet(mcq.question_data),
          codeVisible: !!this.getCodeSnippet(mcq.question_data), // default visibility
          codeOutput: '', // Initialize code output
          outputerror: '', // Initialize output error,
          language: '',
          runcode: false, // Initialize run code flag
        }));
        this.loading = false;
        console.log(this.mcqs);
        
      },
      error: (err) => {
        this.error = 'Something went wrong';
        this.loading = false;
      },
    });
  }

  generateFromPrompt() {
    this.loading = true;
    this.error = '';
    const payload = { prompt: this.customPrompt };

    this.mcqService.generateMcqs(payload).subscribe({
      // next: (res: any) => {
      //   this.mcqs = res.response;
      //   this.loading = false;
      // },
      // error: (err) => {
      //   this.error = 'Something went wrong';
      //   this.loading = false;
      // },
      next: (res: any) => {
      this.mcqs = res.response.map((mcq: any) => ({
        ...mcq,
        questionText: this.getQuestionText(mcq.question_data),
        codeSnippet: this.getCodeSnippet(mcq.question_data),
        codeVisible: !!this.getCodeSnippet(mcq.question_data), // default visibility
        codeOutput: '', // Initialize code output
        outputerror: '', // Initialize output error
        verify: false, // Initialize verify flag
        upload: false, // Initialize upload flag
      }));
      console.log(this.mcqs);
      
      this.loading = false;
    }
    });
  }

  verifySplitQuestion(mcq: any) {
    mcq.verify = true;
    if(mcq.codeVisible) {    
      // include codeOutput in this
      mcq.codeOutput = mcq.codeOutput || '';  
      mcq.question_data = this.combineQuestionAndCode(mcq.questionText, mcq.codeSnippet, mcq.codeVisible);
      mcq.code_snippet = mcq.codeSnippet
      mcq.questionText = mcq.questionText


      this.verifyQuestion(mcq);
    } else {
      mcq.question_data = mcq.questionText;
      mcq.code_snippet = '';
      this.verifyQuestion(mcq);
    }
  }

  uploadSplitQuestion(mcq: any) {
    
    // if(!mcq.token){
    //   alert('❌ Please enter a token to upload the question.');
    //   return;
    // }
    // this.uploading = true;
    mcq.question_data = this.combineQuestionAndCode(mcq.questionText, mcq.codeSnippet, mcq.codeVisible);
    this.uploadQuestion(mcq);
  }


  verifyQuestion(mcq: any) {
    // Simple check for one correct answer and valid format
    console.log(mcq);
    
    const isValid =
      mcq.question_data &&
      mcq.options.length === 4 &&
      mcq.answer.args.length === 1 &&
      mcq.options.some((opt: { text: any; }) => opt.text === mcq.answer.args[0]);
      // check whether the codeoutput & answer were equal
      if(mcq.codeOutput != ''){
      if(mcq.code_snippet && mcq.code_snippet.trim() !== '') {
        if(mcq.codeOutput && mcq.codeOutput.trim() !== '' ) {
          if(mcq.codeOutput.trim() !== mcq.answer.args[0].trim()) {
            mcq.verify = false;
            alert('❌ Code output does not match the answer.');
            return;
          }
        } else {
          mcq.verify = false;
          alert('❌ Code output is empty.');
          return;
        }
      }
    }

    // check there is no duplicate options
    const optionsSet = new Set(mcq.options.map((opt: { text: any; }) => opt.text));
    if (optionsSet.size !== mcq.options.length) {
      mcq.verify = false;
      alert('❌ Duplicate options found.');
      return;
    }

  
    if (isValid) {
      const payload = {
        question: mcq.question_data,
        code_snippet: mcq.code_snippet || '',
        questionText: mcq.questionText || '',
        options: mcq.options.map((opt: { text: any; }) => opt.text),
        answer: mcq.answer.args[0],
      };
      console.log(payload);
        
      this.mcqService.verifyMcqs(payload).subscribe({
        next: (res: any) => {
          console.log(res);
          // check by converting to lowercase
          if(res.response.toLowerCase() === 'correct') 
          {
            mcq.verify = false;
            alert('✅ Question verified successfully.\n✅ 4 options found.\n✅ 1 correct answer found.\n✅ No duplicate options found.');
          } else {
            mcq.verify = false;
            alert('❌ Verification failed.\n' + res.response);
          }
        },
        error: (err) => {
          mcq.verify = false;
          alert('❌ Verification failed.');
        },
      });
    } else {
      mcq.verify = false;
      alert('❌ Invalid question format or missing data.');
    }
  }

  uploadQuestion(mcq: any) {
    console.log(mcq);
    if(!this.mcqForm.value.token){
      alert('❌ Please enter a token to upload the question.');
      return;
    }
    // set difficulty level to easy
    mcq.difficulty_level = mcq.difficulty_level || mcq.difficulty || 'Easy';
    
    mcq.upload = true;
    this.error = '';

    const payload = {
      token: this.mcqForm.value.token,
      response: [mcq],
      qb_id: this.mcqForm.value.qb_id || '', // Question bank ID
      createdBy: this.mcqForm.value.createdBy || '', // Creator's name or ID
    };

    console.log(payload);
    
  
    this.mcqService.uploadMcqs(payload).subscribe({
      next: (res: any) => {
        if(res.response[0].status == 'Failed') {
          mcq.upload = false;
        alert('Question uploading failed.');

        } else {
        mcq.upload = true;
        alert('✅ Question uploaded successfully.');
        }
      },
      error: (err) => {
        mcq.upload = false;
        this.error = 'Something went wrong';
      },
    });
  }

  uploadAllQuestion(mcq: any) {
    if(!this.mcqForm.value.token) {
      alert('❌ Please enter a token to upload the questions.');
      return;
    }
    // set all the mcq.question_data to the combined question and code snippet
    this.mcqs.forEach((item) => {
      item.question_data = this.combineQuestionAndCode(item.questionText, item.codeSnippet, item.codeVisible);
      item.code_snippet = item.codeSnippet;
      item.questionText = item.questionText;
      item.difficulty_level = item.difficulty_level || item.difficulty || 'Easy';
    });
// if any mcq.upload is true, then dont upload that question
    const mcqsToUpload = this.mcqs.filter(item => !item.upload);
    if(mcqsToUpload.length === 0) {
      alert('❌ All questions are already uploaded.');
      return;
    }
    



    this.uploading = true;
    this.error = '';
    console.log(mcqsToUpload);
    
    // this.loading = true;
    this.error = '';
    

    const payload = {
      token: this.mcqForm.value.token,
      response: mcqsToUpload,
      qb_id: this.mcqForm.value.qb_id || '', // Question bank ID
      createdBy: this.mcqForm.value.createdBy || '', // Creator's name or ID
    };

    console.log(payload);
    
  
    this.mcqService.uploadMcqs(payload).subscribe({
      next: (res: any) => {
        alert('✅ Question uploaded successfully.');
        this.uploading = false;
        this.mcqs.forEach((item) => {
          item.upload = true; // Mark all questions as uploaded
          });
        },
      error: (err) => {
        this.error = 'Something went wrong';
        this.uploading = false;
      },
    });
  }

  runCode(code: string, index: number, mcq: any): void {
    mcq.runcode = true;
    // This method can be used to run the code snippet if needed

    // For now, we will just log the code to the console
    if(!this.language){
      mcq.runcode = false;
      alert('❌ Please select a language.');
      return;
    }
    const payload = {
      code_snippet: code,
      language: this.language
      };
    this.mcqService.runCode(payload).subscribe({
      next: (res: any) => {
        console.log('Code executed successfully:', res);
        
        if(res.response.result || res.response.code_snippet) {
          this.mcqs[index].codeOutput = res.response.result || 'No output returned';
          this.mcqs[index].codeSnippet = res.response.code_snippet || '';
          this.mcqs[index].outputerror = '';
        }

        if(!res.response.result || !res.response.code_snippet) {
          this.mcqs[index].outputerror = res.response || 'No output returned';
          this.mcqs[index].codeOutput = '';
        }
        mcq.runcode = false;
        // alert('✅ Code executed successfully.');
      },
      error: (err) => {
        mcq.runcode = false;
        console.error('Error executing code:', err);
        alert('❌ Error executing code.');
      },
    });
  }
}


import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { McqServiceService } from '../../services/mcq-service.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MonacoEditorModule, MONACO_PATH, MonacoEditorComponent, MonacoEditorConstructionOptions, MonacoStandaloneCodeEditor } from '@materia-ui/ngx-monaco-editor';
import { editor } from 'monaco-editor';

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
  codeOutput: string = '';
  error = '';
  outputerror = '';
  customPrompt = '';
  mode: 'form' | 'prompt' = 'form';
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
      // codeOutput: [''], // Output for code execution
    });
  }

  getQuestionText(fullText: string): string {
    return fullText?.split('$$$examly')[0]?.trim() || '';
  }

  getCodeSnippet(fullText: string): string {
    return fullText?.split('$$$examly')[1]?.trim() || '';
  }

  combineQuestionAndCode(question: string, code: string): string {
    if (code) {
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
          outputerror: '', // Initialize output error
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
      }));
      console.log(this.mcqs);
      
      this.loading = false;
    }
    });
  }

  verifySplitQuestion(mcq: any) {
    if(mcq.codeVisible) {    
      // include codeOutput in this
      mcq.codeOutput = mcq.codeOutput || '';  
      mcq.question_data = this.combineQuestionAndCode(mcq.questionText, mcq.codeSnippet);
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
    mcq.question_data = this.combineQuestionAndCode(mcq.questionText, mcq.codeSnippet);
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
      if(mcq.code_snippet && mcq.code_snippet.trim() !== '') {
        if(mcq.codeOutput && mcq.codeOutput.trim() !== '') {
          if(mcq.codeOutput.trim() !== mcq.answer.args[0].trim()) {
            alert('❌ Code output does not match the answer.');
            return;
          }
        } else {
          alert('❌ Code output is empty.');
          return;
        }
      }

    // check there is no duplicate options
    const optionsSet = new Set(mcq.options.map((opt: { text: any; }) => opt.text));
    if (optionsSet.size !== mcq.options.length) {
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
            alert('✅ Question verified successfully.\n✅ 4 options found.\n✅ 1 correct answer found.\n✅ No duplicate options found.');
          } else {
            alert('❌ Verification failed.');
          }
        },
        error: (err) => {
          alert('❌ Verification failed.');
        },
      });
    } else {
      alert('❌ Invalid question format or missing data.');
    }
  }

  uploadQuestion(mcq: any) {
    console.log(mcq);
    // set difficulty level to easy
    mcq.difficulty_level = mcq.difficulty_level || mcq.difficulty || 'Easy';
    
    this.loading = true;
    this.error = '';

    const payload = {
      token: this.mcqForm.value.token,
      response: [mcq]
    };

    console.log(payload);
    
  
    this.mcqService.uploadMcqs(payload).subscribe({
      next: (res: any) => {
        alert('✅ Question uploaded successfully.');
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Something went wrong';
        this.loading = false;
      },
    });
  }

  uploadAllQuestion(mcq: any) {
    console.log(mcq);
    
    this.loading = true;
    this.error = '';

    const payload = {
      token: this.mcqForm.value.token,
      response: mcq
    };

    console.log(payload);
    
  
    this.mcqService.uploadMcqs(payload).subscribe({
      next: (res: any) => {
        alert('✅ Question uploaded successfully.');
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Something went wrong';
        this.loading = false;
      },
    });
  }

  runCode(code: string, index: number): void {
    // This method can be used to run the code snippet if needed
    // For now, we will just log the code to the console
    const payload = {
      code_snippet: code,
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
        // alert('✅ Code executed successfully.');
      },
      error: (err) => {
        console.error('Error executing code:', err);
        alert('❌ Error executing code.');
      },
    });
  }
}


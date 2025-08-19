import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { NgSelectModule } from '@ng-select/ng-select';
import { CodServiceService } from '../../services/cod-service.service';
import { QuillEditorComponent } from 'ngx-quill';


@Component({
  selector: 'app-cod-generator',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, MonacoEditorModule, NgSelectModule,QuillEditorComponent ],
  templateUrl: './cod-generator.component.html',
  styleUrl: './cod-generator.component.css'
})
export class CodGeneratorComponent {
  questionBanks: any[] = [];
  filteredQuestionBanks: any[] = [];
  codForm: FormGroup;
  promptForm: FormGroup;
  selectedCreator: string = '';
  loading = false;
  error = '';
  inputcheck: any;
  copiedIndex: number | null = null;
  selectedQbId: string | null = null;
  uniqueCreators: string[] = [];
  cods: any;
  subtopics: any[] = [];
  mode: 'form' | 'prompt' = 'form';
  outputerror = '';
  customPrompt = '';
  language = '';
  token: any;
  // editorOptions = { theme: 'vs-dark', language: 'java' };
  editorOptions = {theme: 'vs-dark', language: 'csharp'};
  code: string= '';
  solution: any;
  sampleInput:any
  // weightage: any;

  toolbarOptions = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['code-block', 'link'],
      [{ 'header': [1, 2, 3, false] }]
    ]
  };

  
  constructor(private fb: FormBuilder, private codService: CodServiceService) {
    this.codForm = this.fb.group({
      question_count: [5, Validators.required],
      options_count: [4, Validators.required],
      difficulty_level: ['Easy', Validators.required],
      code_snippet: [0, Validators.required],
      topic: ['', Validators.required],
      token: ['', Validators.required ], // Token for authentication
      qb_id: [''], // Question bank ID
      searchText: [''],
      // createdBy: [''], // Creator's name or ID
      // codeOutput: [''], // Output for code execution
      sub_topic_id: [''],
      topic_id: [''],
      subject_id: [''],
      topic_name: [''],
      subject_name: [''],
    });

    this.promptForm = this.fb.group({
      prompt: ['generate a scenario based hard level java programing description on method overloading', Validators.required],
      token: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vyc19kb21haW5faWQiOjQzMTY0NzUsInVzZXJfaWQiOiJiZDNjMmY0ZC1iNTNkLTRkZTYtODJjOS0wMDQxM2I3MDc1NmMiLCJzY2hvb2xfaWQiOiJmZTY1MDJmMC1kZmU1LTRlYzMtYjE4MS0zZThlMzRiMTk4OTQiLCJlbWFpbCI6ImRpdmFrYXIuc0BpYW1uZW8uYWkiLCJlbWFpbF92ZXJpZmllZCI6MSwibmFtZSI6IkRpdmFrYXIkUyIsInBob25lIjoiOTg5NDE1NzYxOSIsInBob25lX3ZlcmlmaWVkIjowLCJwcm9maWxlX3BpYyI6bnVsbCwiZ2VuZGVyIjoiTWFsZSIsInJvbGxfbm8iOm51bGwsInBvcnRhbF9hY2Nlc3Nfc3RhdHVzIjpudWxsLCJlbWFpbF9yZXF1ZXN0ZWRfaGlzdG9yeSI6bnVsbCwiZW1haWxfcmVxdWVzdGVkIjpudWxsLCJwcmltYXJ5X2VtYWlsIjoiZGl2YWthci5zQGlhbW5lby5haSIsInBhcmVudF9jb250YWN0IjpudWxsLCJwaG9uZV9udW1iZXIiOnsiY29kZSI6Iis5MSIsIm51bWJlciI6OTg5NDE1NzYxOX0sImlzX2ZvbGxvd2luZ19wdWJsaWNfZmVlZCI6ZmFsc2UsImJhZGdlIjowLCJzdXBlcmJhZGdlIjowLCJjb25zdW1lZF9iYWRnZSI6MCwiY29uc3VtZWRfc3VwZXJiYWRnZSI6MCwibWFubnVhbGJhZGdlcyI6bnVsbCwic3RhdHVzIjoiSW52aXRlZCIsImRvYiI6bnVsbCwic3RhZmZfdHlwZSI6IkludGVybmFsIiwidmVyaWZpZWRfcGljIjpudWxsLCJhcHBsaWNhdGlvbl9ubyI6bnVsbCwiaGFzaF9pZCI6IjczOWM0Y2ZmNTc0OWQ2YTIzYzIzMTU2N2FmMmY3ODliZjM1ZmE5MTEiLCJyZXNldF9wYXNzd29yZCI6ZmFsc2UsImNyZWF0ZWRBdCI6IjIwMjMtMDctMjBUMTg6MTQ6NDIuMDAwWiIsInVwZGF0ZWRBdCI6IjIwMjQtMTItMTlUMTM6MTA6MzAuMDAwWiIsImRlbGV0ZWRBdCI6bnVsbCwicmVkaXNSb2xlIjoiU3RhZmYiLCJzZXNzaW9uSUQiOiJGNmJybDhvMDRhQzV1SnJqY1pPdTJRPT0iLCJlbmFibGVUd29GYWN0b3JBdXRoZW50aWNhdGlvbiI6ZmFsc2UsImlhdCI6MTc1NTYyMTM1NiwiZXhwIjoxNzU1NjY0NTU2fQ.05yuaqDwivhYiRteOPim9s0a__n_VLOMGp61U5mDLzg', Validators.required], // Token for authentication
      qb_id: [''], // Question bank ID
      searchText: ['dummy'],
      code_snippet: [0, Validators.required],
    });
  }

  onSubtopicChangeById(event: Event) {
    console.log(event);
    
  //   const selectElement = event.target as HTMLSelectElement;
  // const selectedSubtopicId = selectElement.value;
  // console.log('subtopic changed', selectedSubtopicId);
  
    const selected = this.subtopics.find(
      (s) => s.sub_topic_id === event
    );
    if (selected) {
      this.codForm.patchValue({
        sub_topic_id: selected.sub_topic_id,
        topic_id: selected.topic.topic_id,
        subject_id: selected.topic.subject.subject_id,
        topic_name: selected.topic.name,
        subject_name: selected.topic.subject.name,
      });
    }
  }

  customSearchFn = (term: string, item: any) => {
    const lowerTerm = term.toLowerCase();
    return (
      item.name.toLowerCase().includes(lowerTerm) ||
      item.topic.name.toLowerCase().includes(lowerTerm) ||
      item.topic.subject.name.toLowerCase().includes(lowerTerm) 
    );
  };

  filterByCreator() {
    if (this.selectedCreator) {
      this.filteredQuestionBanks = this.questionBanks.filter(
        qb => qb.createdBy === this.selectedCreator
      );
    } else {
      this.filteredQuestionBanks = [...this.questionBanks];
    }
  }

  selectQB(qb: any) {
    this.selectedQbId = qb.qb_id;
  }

  extractUniqueCreators() {
    const creators = this.questionBanks.map(qb => qb.createdBy).filter(Boolean);
    this.uniqueCreators = Array.from(new Set(creators));
  }

    generateFromPrompt() {
    this.loading = true;
    this.error = '';
    // const payload = { prompt: this.customPrompt };
    const payload = this.promptForm.value;
    console.log(payload);
    this.selectedQbId = '';

    const qbPayload = {
      search: this.promptForm.value.searchText,
      authToken: this.promptForm.value.token,
    };

    this.codService.getQuestionBanks(qbPayload).subscribe({
    next: (res: any) => {
      this.questionBanks = res.results.questionbanks || [];
      this.filteredQuestionBanks = [...this.questionBanks]; // initially no filter
      this.extractUniqueCreators();
    },
    error: (err) => {
      console.error('Error fetching QBs:', err);
    }
  });
    

    this.codService.generateCods(payload).subscribe({
      // next: (res: any) => {
      //   this.mcqs = res.response;
      //   this.loading = false;
      // },
      // error: (err) => {
      //   this.error = 'Something went wrong';
      //   this.loading = false;
      // },
      next: (res: any) => {
      this.cods = res.response.map((cod: any) => ({
        ...cod,
        // questionText: this.getQuestionText(mcq.question_data),
        // codeSnippet: this.getCodeSnippet(mcq.question_data),
        // codeVisible: !!this.getCodeSnippet(mcq.question_data), // default visibility
        // codeOutput: '', // Initialize code output
        // outputerror: '', // Initialize output error
        // verify: false, // Initialize verify flag
        // upload: false, // Initialize upload flag

      }));
      console.log(this.cods);
      
      this.loading = false;
    }
    });
    // call the getTopics() method to fetch topics
    this.codService.getTopics(this.codForm.value.token || this.promptForm.value.token).subscribe({
      next: (res: any) => {
        console.log(res.data);
        this.subtopics = res.data;

      if (this.subtopics.length > 0) {
        const first = this.subtopics[0];
        this.codForm.patchValue({
          sub_topic_id: first.sub_topic_id,
          topic_id: first.topic.topic_id,
          subject_id: first.topic.subject.subject_id,
          topic_name: first.topic.name,
          subject_name: first.topic.subject.name,

        });
      }
      console.log(this.codForm.value);
      
      },
      error: (err) => {
        this.error = 'Something went wrong';
        this.loading = false;
      },
    });
  }

  generateSolution(cod: any) {
    console.log(cod);
    this.codService.generateSolution(cod).subscribe({
      next: (res: any) => {
        console.log('Solution generated:', res);
        this.solution = res.response[0].solution_data;
        this.sampleInput = res.response[0].samples || '';
        this.sampleInput.forEach((sample: any) => {
          sample.output ='';
        } );

        // this.solutionInput = res.response[0].input || '';
        
        cod.code = res.response[0].solution_data;
        cod.outputerror = res.response.error || '';
        cod.upload = true; // Set upload to true after successful generation
      },
      error: (err) => {
        cod.outputerror = 'Error generating solution';
        console.error('Error generating solution:', err);
      }
    });
    
  }

  runCode(code: any, i: number, cod: any) {
    cod.runcode = true; // Set runcode to true when running code
    this.codService.runCode({ code, input: cod.input }).subscribe({
      next: (res: any) => {
        console.log('Code executed successfully:', res);
        cod.codeOutput = res.output || '';
        if (res.error) {
          cod.outputerror = res.error + " - " +res.details;
        }
        cod.runcode = false; // Reset runcode after execution
      },
      error: (err) => {
        cod.outputerror = 'Error running code';
        console.error('Error running code:', err);
        cod.runcode = false; // Reset runcode on error
      }
    });
  }
 
  // Add new sample
addSample() {
  this.sampleInput.push({
    input: '',
    output: '',
    error: '',
    running: false,
    isSelected: false
  });
}

// Run sample execution
runSample(code: string, index: number, sample: any) {
  sample.running = true;
  sample.output = '';
  sample.error = '';

  this.codService.runCode({code, input: sample.input}).subscribe({
    next: (res: any) => {
      sample.output = res.output || '';
      sample.timeBytes = res.timeBytes || '';
      sample.memBytes = String(res.memBytes || '');
      sample.timeLimit = null;
      sample.outputLimit= null;
      sample.memoryLimit= null;
      if (res.error) {
          sample.error = res.error + " - " +res.details;
        }
      sample.running = false;
    },
    error: (err) => {
      sample.error = 'Error executing code';
      sample.running = false;
      console.error(err);
    }
  });
}

uploadCOD(cod:any){
  console.log(cod);
  console.log(this.sampleInput);
  
  
}




}

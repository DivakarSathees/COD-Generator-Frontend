import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { McqServiceService } from '../../services/mcq-service.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-mcq-generator',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './mcq-generator.component.html',
  styleUrl: './mcq-generator.component.css'
})
export class McqGeneratorComponent {
  mcqForm: FormGroup;
  mcqs: any[] = [];
  loading = false;
  error = '';
  customPrompt = '';
  mode: 'form' | 'prompt' = 'form';
  token: any;

  constructor(private fb: FormBuilder, private mcqService: McqServiceService) {
    this.mcqForm = this.fb.group({
      question_count: [5, Validators.required],
      options_count: [4, Validators.required],
      difficulty_level: ['Easy', Validators.required],
      topic: ['', Validators.required],
      token: [''], // Token for authentication
    });
  }

  generateFromForm() {
    this.loading = true;
    this.error = '';
    const payload = this.mcqForm.value;

    this.mcqService.generateMcqs(payload).subscribe({
      next: (res: any) => {
        this.mcqs = res.response;
        this.loading = false;
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
      next: (res: any) => {
        this.mcqs = res.response;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Something went wrong';
        this.loading = false;
      },
    });
  }

  verifyQuestion(mcq: any) {
    // Simple check for one correct answer and valid format
    const isValid =
      mcq.question_data &&
      mcq.options.length === 4 &&
      mcq.answer.args.length === 1 &&
      mcq.options.some((opt: { text: any; }) => opt.text === mcq.answer.args[0]);
  
    if (isValid) {
      const payload = {
        question: mcq.question_data,
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
            alert('✅ Question verified successfully.');
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
}


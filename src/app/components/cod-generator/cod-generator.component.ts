import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { NgSelectModule } from '@ng-select/ng-select';
import { CodServiceService } from '../../services/cod-service.service';
import { QuillEditorComponent } from 'ngx-quill';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-cod-generator',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, MonacoEditorModule, NgSelectModule,QuillEditorComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule
   ],
  templateUrl: './cod-generator.component.html',
  styleUrl: './cod-generator.component.css'
})
export class CodGeneratorComponent implements OnInit {

  ngOnInit(): void {
    this.getAllSessions();
  }
  

  questionBanks: any[] = [];
  filteredQuestionBanks: any[] = [];
  codForm: FormGroup;
  promptForm: FormGroup;
  selectedCreator: string = '';
  loading = false;
  error = '';
  success = '';
  inputcheck: any;
  copiedIndex: number | null = null;
  selectedQbId: string | null = null;
  uniqueCreators: string[] = [];
  solutionGenerated= false;
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
  sessions: any;
  selecetSessionName: string = '';
  selectedSessionLanguage: string = '';
  selectedSessionId: string = '';
  newSession: any;
  // weightage: any;

  toolbarOptions = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['code-block', 'link'],
      [{ 'header': [1, 2, 3, false] }]
    ]
  };

    // Sidebar sessions
    // sessions: Array<{ id: string; name: string; createdAt: Date }> = [
    //   { id: '1', name: 'Session 1', createdAt: new Date('2025-09-01T10:00:00') },
    //   { id: '2', name: 'Session 2', createdAt: new Date('2025-09-05T14:30:00') },
    //   { id: '3', name: 'Session 3', createdAt: new Date('2025-09-08T09:15:00') }
    // ];
    
    uniqueTopics: string[] = [];

  sampleFormatOptions = [
    { value: 'detailed', label: 'Detailed', title: `<h3>Problem Statement: Bike Number Plate Verification System</h3><h4>Objective</h4><p>Create a Bike Number Plate Verification System using C# OOP principles. The system should validate number plates based on specific rules and check if they are allowed on the road. Implement classes and methods to handle the verification process dynamically.</p><h4>Requirements</h4><p><strong>1. NumberPlate Class</strong>:</p><ul><li><strong>Properties</strong>:</li><li class="ql-indent-1">PlateNumber (string): The number plate of the bike.</li><li class="ql-indent-1">IsValid (bool): Indicates if the number plate is valid based on the rules.</li><li><strong>Methods</strong>:</li><li class="ql-indent-1"><strong>Validate()</strong>: Validates the number plate based on the following rules:</li><li class="ql-indent-2">The length of the number plate should be 9</li><li class="ql-indent-2">The number plate must start with two uppercase letters.</li><li class="ql-indent-2">Followed by two digits.</li><li class="ql-indent-2">Followed by a hyphen.</li><li class="ql-indent-2">Ends with four digits.</li><li class="ql-indent-1">Example of a valid number plate: "AB12-3456".</li></ul><p><strong>2. Bike Class</strong>:</p><ul><li>Properties:</li><li class="ql-indent-1">BikeID (string): Unique identifier for the bike.</li><li class="ql-indent-1">NumberPlate (NumberPlate): The bike's number plate.</li><li>Methods:</li><li class="ql-indent-1"><strong>IsNumberPlateValid()</strong>: Checks if the bike's number plate is valid and returns the result.</li></ul><p><strong>3. VerificationSystem Class</strong>:</p><ul><li>Properties:</li><li class="ql-indent-1">Bikes (List&lt;Bike&gt;): List of all bikes to be verified.</li><li>Methods:</li><li class="ql-indent-1"><strong>AddBike(Bike)</strong>: Adds a new bike to the system.</li><li class="ql-indent-1"><strong>VerifyAllBikes()</strong>: Verifies all bikes in the system and prints the validity of their number plates.</li></ul>` },
    { value: 'simple', label: 'Simple', title: 'Sample Coding Format: Write a function to reverse a string.' },
    // { value: 'theory', label: 'Theory', title: 'Sample Theory Format: Explain OOP concepts with examples.' },
    // { value: 'fillblank', label: 'Fill in the Blank', title: 'Sample Fill in the Blank: The capital of France is ____.' }
  ];

  
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
      prompt: ['', Validators.required],
      token: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vyc19kb21haW5faWQiOjQzMTY0NzUsInVzZXJfaWQiOiJiZDNjMmY0ZC1iNTNkLTRkZTYtODJjOS0wMDQxM2I3MDc1NmMiLCJzY2hvb2xfaWQiOiJmZTY1MDJmMC1kZmU1LTRlYzMtYjE4MS0zZThlMzRiMTk4OTQiLCJlbWFpbCI6ImRpdmFrYXIuc0BpYW1uZW8uYWkiLCJlbWFpbF92ZXJpZmllZCI6MSwibmFtZSI6IkRpdmFrYXIkUyIsInBob25lIjoiOTg5NDE1NzYxOSIsInBob25lX3ZlcmlmaWVkIjowLCJwcm9maWxlX3BpYyI6bnVsbCwiZ2VuZGVyIjoiTWFsZSIsInJvbGxfbm8iOm51bGwsInBvcnRhbF9hY2Nlc3Nfc3RhdHVzIjpudWxsLCJlbWFpbF9yZXF1ZXN0ZWRfaGlzdG9yeSI6bnVsbCwiZW1haWxfcmVxdWVzdGVkIjpudWxsLCJwcmltYXJ5X2VtYWlsIjoiZGl2YWthci5zQGlhbW5lby5haSIsInBhcmVudF9jb250YWN0IjpudWxsLCJwaG9uZV9udW1iZXIiOnsiY29kZSI6Iis5MSIsIm51bWJlciI6OTg5NDE1NzYxOX0sImlzX2ZvbGxvd2luZ19wdWJsaWNfZmVlZCI6ZmFsc2UsImJhZGdlIjowLCJzdXBlcmJhZGdlIjowLCJjb25zdW1lZF9iYWRnZSI6MCwiY29uc3VtZWRfc3VwZXJiYWRnZSI6MCwibWFubnVhbGJhZGdlcyI6bnVsbCwic3RhdHVzIjoiSW52aXRlZCIsImRvYiI6bnVsbCwic3RhZmZfdHlwZSI6IkludGVybmFsIiwidmVyaWZpZWRfcGljIjpudWxsLCJhcHBsaWNhdGlvbl9ubyI6bnVsbCwiaGFzaF9pZCI6IjczOWM0Y2ZmNTc0OWQ2YTIzYzIzMTU2N2FmMmY3ODliZjM1ZmE5MTEiLCJyZXNldF9wYXNzd29yZCI6ZmFsc2UsImNyZWF0ZWRBdCI6IjIwMjMtMDctMjBUMTg6MTQ6NDIuMDAwWiIsInVwZGF0ZWRBdCI6IjIwMjQtMTItMTlUMTM6MTA6MzAuMDAwWiIsImRlbGV0ZWRBdCI6bnVsbCwicmVkaXNSb2xlIjoiU3RhZmYiLCJzZXNzaW9uSUQiOiJMZStYbXRMVlhGY1BwWEVpNDJsbXdRPT0iLCJlbmFibGVUd29GYWN0b3JBdXRoZW50aWNhdGlvbiI6ZmFsc2UsImlhdCI6MTc1NzE3NDk5NiwiZXhwIjoxNzU3MjE4MTk2fQ.KMwagd95-1rDRiMhWTnDBbobe7oN4WABWxHDbsTgcyo', Validators.required], // Token for authentication
      qb_id: [''], // Question bank ID
      searchText: ['Dummy_testing_COD_creation'],
      code_snippet: [0, Validators.required],
      language: ['Java', Validators.required],
      difficulty_level: ['Easy', Validators.required],
      topic: ['', Validators.required],
      format: ['detailed', Validators.required],
      sub_topic_id: [''],
      topic_id: [''],
      subject_id: [''],
      topic_name: [''],
      subject_name: [''],
    });
  }

    getAllSessions(){
    this.codService.getAllSessions().subscribe({
    next: (res: any) => {
      console.log('Sessions fetched:', res);
      this.sessions = res.sessions;
      if(this.sessions.length > 0){
        this.selectedSessionId = this.sessions[0].id;
      } else {
        this.selectedSessionId = '';
      }
    } });
  }

  // selectedSessionId = this.sessions[0]?.id || '';

    selectSession(session: any) {
      this.newSession = false;
      // this.selectedSessionId = session._id;
      if (this.selectedSessionId === session._id) {
        // If already selected, deselect
        this.selectedSessionId = '';
        sessionStorage.removeItem('codSessionId');
        this.promptForm.get('language')?.enable(); // make editable again
        this.promptForm.get('topic')?.enable();
      } else {
        // Otherwise select
        this.selectedSessionId = session._id;
        this.promptForm.get('prompt')?.setValue(''); // clear the prompt field
         sessionStorage.setItem('codSessionId', this.selectedSessionId);
        const lang = session.name.split(' - ')[0];
        const topic = session.name.split(' - ')[1];
        // push this topic to uniqueTopics if not already present
        if (!this.uniqueTopics.includes(topic)) {
          this.uniqueTopics.push(topic);
        }
      console.log(lang);
      
      this.promptForm.patchValue({ language: lang, topic: topic });
      this.promptForm.get('language')?.setValue(lang);
      this.promptForm.get('topic')?.setValue(topic);

      this.promptForm.get('language')?.disable();
      this.promptForm.get('topic')?.disable();
      }
      console.log(session);
      // set the forms value of lanaguage field by session.name but session name is like java - oops, from this split till -
      



      this.codService.getConversationsById(this.selectedSessionId).subscribe({
      next: (res: any) => {
        console.log('Conversations fetched for session:', res);
      } });
    }

    createNewSession() {
      this.newSession = true
      this.promptForm.get('language')?.enable(); // make editable again
        this.promptForm.get('topic')?.enable();
      sessionStorage.removeItem('codSessionId');
      this.selectedSessionId = '';
    }


  onSubtopicChangeById(event: Event) {
    console.log(event);
    
  //   const selectElement = event.target as HTMLSelectElement;
  // const selectedSubtopicId = selectElement.value;
  // console.log('subtopic changed', selectedSubtopicId);
  
    const selected = this.subtopics.find(
      (s) => s.sub_topic_id === event
    );
    console.log('Selected subtopic:', selected);
    
    if (selected) {
      this.promptForm.patchValue({
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
    this.selectedQbId = '';
    // include sessionId from session storage in the payload
    const sessionId = sessionStorage.getItem('codSessionId');
    payload.sessionId = sessionId;
    payload.language = this.promptForm.value.language;
    payload.topic = this.promptForm.value.topic;
    payload.language = this.promptForm.get('language')?.value;
    payload.topic = this.promptForm.get('topic')?.value;
    console.log(payload);

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
        
        this.language = res.response.result[0].language || '';
      console.log(res.response.sessionId);
      // store sessionId in session storage
      sessionStorage.setItem('codSessionId', res.response.sessionId);
      // this.cods = res.response;
      this.cods = res.response.result.map((cod: any) => ({
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
        this.promptForm.patchValue({
          sub_topic_id: first.sub_topic_id,
          topic_id: first.topic.topic_id,
          subject_id: first.topic.subject.subject_id,
          topic_name: first.topic.name,
          subject_name: first.topic.subject.name,

        });
      }
      console.log(this.promptForm.value);
      
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
        this.solutionGenerated = true
        this.solution = res.response[0].solution_data;
        this.sampleInput = res.response[0].samples || '';
        this.sampleInput.forEach((sample: any) => {
          sample.output ='';
        } );

        // this.solutionInput = res.response[0].input || '';
        
        cod.code = res.response[0].solution_data;
        cod.outputerror = res.response.error || '';
        // cod.upload = true; // Set upload to true after successful generation
      },
      error: (err) => {
        cod.outputerror = 'Error generating solution';
        console.error('Error generating solution:', err);
      }
    });
    
  }

  runCode(code: any, i: number, cod: any) {
    cod.runcode = true; // Set runcode to true when running code
    this.codService.runCode({ code, input: cod.input, language: this.language }).subscribe({
      next: (res: any) => {
        console.log('Code executed successfully:', res);
        cod.codeOutput = res.output+'\n' || '';
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

deleteSample(index: number) {
  this.sampleInput.splice(index, 1);
}


// Run sample execution
runSample(code: string, index: number, sample: any) {
  sample.running = true;
  sample.output = '';
  sample.error = '';
    console.log(sample);


  this.codService.runCode({code, input: sample.input, language: this.language}).subscribe({
    
    next: (res: any) => {
      sample.output = res.output+'\n' || '';
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
  this.success = '';
  this.error = '';
  console.log(cod);
  console.log(this.sampleInput);
  console.log(this.solution);

  // if sampltinput.error is there send a toast error message
  if (this.sampleInput.some((sample: any) => sample.error)) {
    this.error = 'Please resolve all sample errors before uploading.';
    return;
  }

  if (this.sampleInput.some((sample: any) => !sample.output)){
    this.error = 'Please run all samples before uploading or remove unused testcases.';
    return;
  }
  


  // sample payload
//   {
//     "question_type": "programming",
//     "question_data": "<p><strong>Title: Online Shopping Cart - Applying Discounts</strong></p><p><br></p><p>You are working on an online shopping cart application in C#. The cart allows customers to purchase items and calculates the total cost. Implement a program that takes the quantity and unit price of items as input and calculates the total cost, applying discounts as described below:</p><ul><li>If the total quantity of items is 10 or more, apply a 15% discount.</li><li>If the total quantity of items is less than 10, no discount is applied.</li></ul><p><br></p><p><strong>Question</strong>:</p><p>Write a C# program that takes the following inputs:</p><p><br></p><ol><li>The number of items in the cart.</li><li>The unit price of each item.</li></ol><p>The program should calculate the total cost based on the given quantity and unit price, applying the appropriate discount (if applicable). The program should then display the total cost to the user by converting it to a string with two decimal places(ToString(\"F2\")).</p><p><br></p><p>Note:</p><ul><li>The output should be in this format - \"Total cost: {totalcost}\"</li></ul><p><br></p><p><strong style=\"color: var(--tw-prose-bold);\">Classes to be implemented</strong><span style=\"color: var(--tw-prose-bold);\">:</span></p><p>\t<strong style=\"color: var(--tw-prose-bold);\">Program</strong><span style=\"color: var(--tw-prose-bold);\">:</span></p><ul><li>Methods:</li><li class=\"ql-indent-1\"><strong>Main(string[] args)</strong>: The entry point of the program where the user interacts with the system.</li><li class=\"ql-indent-1\"><strong>CalculateTotalCost(int quantity, double unitPrice)</strong>: Method to calculate the total cost of items in the cart, applying a discount if the quantity is 10 or more. Returns - TotalCost of type double.</li></ul>",
//     "question_editor_type": 1,
//     "multilanguage": [
//         "C#"
//     ],
//     "inputformat": "<p>The first line prompts the user to enter the number of items in the cart.</p><p>The second line prompts the user to enter the unit price of each item.</p><p>Both inputs should be positive integers.</p>",
//     "outputformat": "<p>The program should print the total cost of the items, taking into account any applicable discounts.</p>",
//     "enablecustominput": true,
//     "line_token_evaluation": false,
//     "codeconstraints": null,
//     "timelimit": null,
//     "memorylimit": null,
//     "codesize": null,
//     "setLimit": false,
//     "enable_api": false,
//     "outputLimit": null,
//     "subject_id": "15277909-f542-478d-9c4b-3de8e7812734",
//     "blooms_taxonomy": null,
//     "course_outcome": null,
//     "program_outcome": null,
//     "hint": [],
//     "manual_difficulty": "Medium",
//     "solution": [
//         {
//             "language": "C#",
//             "whitelist": [
//                 {
//                     "list": [
//                         "CalculateTotalCost",
//                         "Program",
//                         "double"
//                     ]
//                 }
//             ],
//             "hasSnippet": false,
//             "solutiondata": [
//                 {
//                     "memBytes": 261,
//                     "solution": "using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        //Console.WriteLine(\"Enter the number of items in the cart:\");\r\n        int quantity = int.Parse(Console.ReadLine());\r\n\r\n        //Console.WriteLine(\"Enter the unit price of each item:\");\r\n        double unitPrice = double.Parse(Console.ReadLine());\r\n\r\n        double totalCost = CalculateTotalCost(quantity, unitPrice);\r\n\r\n        Console.WriteLine(\"Total cost: \" + totalCost.ToString(\"F2\"));\r\n    }\r\n\r\n    static double CalculateTotalCost(int quantity, double unitPrice)\r\n    {\r\n        double totalCost = quantity * unitPrice;\r\n\r\n        if (quantity >= 10)\r\n        {\r\n            double discountAmount = totalCost * 0.15;\r\n            totalCost -= discountAmount;\r\n        }\r\n\r\n        return totalCost;\r\n    }\r\n}\r\n",
//                     "timeBytes": 21,
//                     "solutionExp": null,
//                     "solutionbest": true,
//                     "isSolutionExp": false,
//                     "solutionDebug": null
//                 }
//             ],
//             "hideHeader": false,
//             "hideFooter": false
//         }
//     ],
//     "testcases": [
//         {
//             "input": "15\n12.50",
//             "output": "Total cost: 159.38\n",
//             "memBytes": "177",
//             "timeBytes": 46,
//             "difficulty": "Hard",
//             "score": 25,
//             "timeLimit": null,
//             "outputLimit": null,
//             "memoryLimit": null
//         },
//         {
//             "input": "5\n20",
//             "output": "Total cost: 100.00\n",
//             "memBytes": "176",
//             "timeBytes": 35,
//             "difficulty": "Hard",
//             "score": 25,
//             "timeLimit": null,
//             "outputLimit": null,
//             "memoryLimit": null
//         },
//         {
//             "input": "12\n15.75",
//             "output": "Total cost: 160.65\n",
//             "memBytes": "175",
//             "timeBytes": 44,
//             "difficulty": "Hard",
//             "score": 25,
//             "timeLimit": null,
//             "outputLimit": null,
//             "memoryLimit": null
//         },
//         {
//             "input": "7\n30.50",
//             "output": "Total cost: 213.50\n",
//             "memBytes": "175",
//             "timeBytes": 39,
//             "difficulty": "Hard",
//             "score": 25,
//             "timeLimit": null,
//             "outputLimit": null,
//             "memoryLimit": null
//         }
//     ],
//     "topic_id": "fa333ed1-e80d-4640-ba97-54285621feb9",
//     "sub_topic_id": "02276ff5-f6ee-40c6-b152-13040b686d57",
//     "linked_concepts": "",
//     "tags": [
//         ""
//     ],
//     "sample_io": "[{\"input\":\"3\\n7.25\",\"output\":\"Total cost: 21.75\\n\",\"memBytes\":\"177\",\"timeBytes\":32,\"sample\":\"Yes\",\"difficulty\":\" - \",\"score\":\" - \",\"timeLimit\":null,\"outputLimit\":null,\"memoryLimit\":null},{\"input\":\"8\\n10.00\",\"output\":\"Total cost: 80.00\\n\",\"memBytes\":\"175\",\"timeBytes\":40,\"sample\":\"Yes\",\"difficulty\":\" - \",\"score\":\" - \",\"timeLimit\":null,\"outputLimit\":null,\"memoryLimit\":null},{\"input\":\"30\\n2\",\"output\":\"Total cost: 51.00\\n\",\"memBytes\":\"262\",\"timeBytes\":21,\"sample\":\"Yes\",\"difficulty\":\" - \",\"score\":\" - \",\"timeLimit\":null,\"outputLimit\":null,\"memoryLimit\":null}]",
//     "question_media": [],
//     "pcm_combination_ids": [
//         "81ceb3f3-8307-416d-907a-120a95255e8f"
//     ],
//     "qb_id": "77569489-dd77-45e4-8080-ef896a63dcb6",
//     "createdBy": "bd3c2f4d-b53d-4de6-82c9-00413b70756c",
//     "imported": "is_imported_question"
// }

  // Prepare the payload for uploading
  const payload = {
    question_type: 'programming',
    question_data: cod.question_data,
    question_editor_type: 1,
    multilanguage: [this.language],
    inputformat: cod.inputformat,
    outputformat: cod.outputformat,
    enablecustominput: true,
    line_token_evaluation: false,
    codeconstraints: null,
    timelimit: null,
    memorylimit: null,
    codesize: null,
    setLimit: false,
    enable_api: false,
    outputLimit: null,
    subject_id: this.promptForm.value.subject_id || cod.subject_id || '',
    blooms_taxonomy: null,
    course_outcome: null,
    program_outcome: null,
    hint: [],
    manual_difficulty: cod.manual_difficulty || 'Medium',
    solution: [
      {
        language: this.language,
        whitelist: [
          {
            list: [
            ]
          }
        ],
        hasSnippet: false,
        solutiondata: [
          {
            // memBytes: cod.solution?.memBytes || 0,
            solution: this.solution || '',
            // timeBytes: cod.solution?.timeBytes || 0,
            solutionExp: null,
            solutionbest: true,
            isSolutionExp: false,
            solutionDebug: null
          }
        ],
        hideHeader: false,
        hideFooter: false
      }
    ],
    testcases: this.sampleInput
        .filter((sample: any) => !sample.isSelected) // keep only selected
        .map((sample: any) => ({
          input: sample.input,
          output: sample.output,
          memBytes: sample.memBytes || '0',
          timeBytes: sample.timeBytes || 0,
          difficulty: sample.difficulty || 'Medium',
          score: sample.score || 25,
          timeLimit: null,
          outputLimit: null,
          memoryLimit: null
        }
      )
    ),
    topic_id: cod.topic_id || this.promptForm.value.topic_id || '',
    sub_topic_id: cod.sub_topic_id || this.promptForm.value.sub_topic_id || '',
    linked_concepts: '',
    tags: [''],
    sample_io: JSON.stringify(
      this.sampleInput
        .filter((sample: any) => sample.isSelected) // keep only selected
        .map((sample: any) => ({
          input: sample.input,
          output: sample.output,
          memBytes: sample.memBytes || '0',
          timeBytes: sample.timeBytes || 0,
          sample: 'Yes',
          difficulty: ' - ',
          score: ' - ',
          timeLimit: null,
          outputLimit: null,
          memoryLimit: null
        }))
    ),
    question_media: [],
    pcm_combination_ids: [cod.pcm_combination_id || ''],
    qb_id: this.selectedQbId || cod.qb_id || this.promptForm.value.qb_id || '',
    createdBy: cod.createdBy || '',
    imported: cod.imported || 'is_imported_question'  
  };  

  console.log('Payload to upload:', payload);

  // if in payload in total of testcases.score is not 100 show an error message
  const totalScore = payload.testcases.reduce((sum: number, tc: any) => sum + Number(tc.score || 0), 0);
  if (totalScore !== 100) {
    this.error = 'Total score of all test cases must be 100. Currently it is ' + totalScore;
    return;
  }

  // if sampli_io is empty show an error message
  if (payload.sample_io === '[]') {
    this.error = 'Please add at least one sample input/output before uploading.';
    return;
  }

  // Call the uploadCods method from the service
  this.codService.uploadCods(payload, this.promptForm.value.token ).subscribe({
    next: (res: any) => {
      console.log('Upload successful:', res.response[0].status);
      if (res.response[0].status === 'Uploaded') {
        cod.upload = true; 
        this.success = 'COD uploaded successfully!';
      } else {
        this.error = 'Failed to upload COD.';
      }
      // Optionally, reset the form or perform other actions
      // this.codForm.reset();
      // this.promptForm.reset();
      // this.sampleInput = [];
      // this.solution = '';
    }
    ,
    error: (err) => {
      console.error('Error uploading COD:', err);
      this.error = 'Error uploading COD: ' + (err.error?.message || 'Unknown error');
    }
  });
  

  }

  
  
}






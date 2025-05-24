import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class McqServiceService {

  private apiUrl = 'http://localhost:3000'; // adjust as needed

  constructor(private http: HttpClient) {}

  generateMcqs(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-mcq`, data);
  }

  verifyMcqs(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-mcq`, data);
  }

  uploadMcqs(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-to-platform`, data);
  }

  runCode(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/run-code`, data);
  }
}

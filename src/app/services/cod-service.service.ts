import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class CodServiceService {

  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  generateCods(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-cod-description`, data);
  }

  getQuestionBanks(data: any) {
    return this.http.post(`${this.apiUrl}/fetch-qbs`, data);
  }

  getTopics(token: string): Observable<any> {
    return this.http.get(`https://api.examly.io/api/getalldetails`, {
      headers: {
        'Authorization': `${token}`
      }
    });
  }

  generateSolution(cod: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-solution`, cod);
  }

  runCode(code: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/run-java`, code);
  }
}

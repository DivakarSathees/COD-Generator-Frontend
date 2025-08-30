import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class CodServiceService {

  // private apiUrl = 'http://localhost:3000';
  private apiUrl = 'https://cod-generator-backend.onrender.com';

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
    if(code.language === 'Python'){
      return this.http.post(`${this.apiUrl}/run-python`, code);
    } else if(code.language === 'C#'){
      return this.http.post(`${this.apiUrl}/run-csharp`, code);
    } else if(code.language === 'javascript'){
      return this.http.post(`${this.apiUrl}/run-javascript`, code);
    } else if(code.language === 'c'){
      return this.http.post(`${this.apiUrl}/run-c`, code);
    } else if(code.language === 'csharp'){
      return this.http.post(`${this.apiUrl}/run-csharp`, code);
    } else if(code.language === 'ruby'){
      return this.http.post(`${this.apiUrl}/run-ruby`, code);
    }
    return this.http.post(`${this.apiUrl}/run-java`, code);
  }

  uploadCods(data: any, token: any): Observable<any> {
    const decode = this.decodeToken(token);
    console.log('Decoded Token:', decode.user_id);
    data.createdBy = decode.user_id; // Add user_id to the data object
    console.log(data);
    

    return this.http.post(`${this.apiUrl}/upload-to-platform`, { data, token });
  }

  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      console.log(JSON.parse(atob(payload)));
      
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}

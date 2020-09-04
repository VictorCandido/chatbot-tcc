import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PerguntasService {

  private readonly apiUrl = environment.apiUrl + '/questions';

  constructor(
    private http: HttpClient
  ) { }

  findAll() {
    return this.http.get(`${this.apiUrl}/findAll`);
  }

  delete(id: any) {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  store(question: string, keywords: string, answer: string) {
    return this.http.post(`${this.apiUrl}/save`, {
      question,
      keywords,
      answer
    });
  }
}

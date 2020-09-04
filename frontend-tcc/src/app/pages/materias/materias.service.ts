import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  private readonly apiChatbot = environment.apiUrl + '/chatbot';
  private readonly apiUnderstanding = environment.apiUrl + '/understanding';

  constructor(
    private http: HttpClient
  ) { }

  startConversation(): any {
    return this.http.get(this.apiChatbot);
  }

  sendMessage(text, context) {
    return this.http.post(this.apiChatbot, {
      input: {
        text
      },
      context
    });
  }

  sendQuestion(text) {
    return this.http.post(this.apiUnderstanding, {
      text
    });
  }
}

import { environment } from 'src/environments/environment';
import { MateriasService } from './materias.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-materias',
  templateUrl: './materias.component.html',
  styleUrls: ['./materias.component.css']
})
export class MateriasComponent implements OnInit {

  public localMessage: string;
  public status: string;
  public conversation = new Array();
  public categories = [
    // 'science', 'chemistry', 'physics',
    // 'mathematics', 'arithmetic', 'algebra',
    'law, govt and politics', 'history', 'society', 'government',  // História
    'heads of state', 'imigration', 'society', 'unrest and war',  // História
    'education'
  ];

  @ViewChild('chatBody', { static: true })
  private chatBody: ElementRef;

  private context = {};
  private foiUtil = false;
  private keywords: string;
  private originalQuestion: string;

  constructor(
    private materiaService: MateriasService
  ) { }

  ngOnInit(): void {
    this.status = 'Digitando...';

    this.materiaService.startConversation().subscribe(res => {
      if (res.type === 'startConversation-answer') {
        res.response.output.text.forEach(text => {
          this.addRemoteMessage(text);
        });

        this.context = res.context;
        this.status = 'Online';
      }
    });
  }

  onKey($event) {
    if ($event.keyCode === 13) {
      this.addLocalMessage();
    }
  }

  addRemoteMessage(text) {
    this.conversation.push({ class: 'remote-message', text });

    setTimeout(() => {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight + 1000;
      this.status = 'Online';
    }, 100);
  }

  /**
   * Adiciona a mensagem do usuário local e faz a requisição
   */
  addLocalMessage() {
    if (this.localMessage) {
      // Monta todo o contexto da mensagem atual
      const contextParam = { context: this.context, foiUtil: this.foiUtil, categories: this.categories };

      if (this.foiUtil) {
        Object.assign(contextParam, { keywords: this.keywords, originalQuestion: this.originalQuestion });
      }

      this.status = 'Digitando...';
      // Envia a mensagem para o servidor
      this.materiaService.sendMessage(this.localMessage, contextParam).subscribe((res: any) => {
        switch (res.type) {
          case environment.typeMessages.chat_answer:
            // Resposta do Assistant (chatbot)
            res.response.output.text.forEach(text => {
              this.addRemoteMessage(text);
            });

            // Salva o contexto da conversa local
            this.context = res.response.context;

            break;

          case environment.typeMessages.question_success:
            // Resposta encontrada na internet
            this.keywords = res.response.keywords;
            this.originalQuestion = res.response.originalQuestion;
            this.addRemoteMessage(res.response.text);
            this.addRemoteMessage('Essa resposta foi útil?');
            this.foiUtil = true;

            break;

          case environment.typeMessages.db_answer:
            // Resposta encontrada no banco de dados
            this.addRemoteMessage('Isso foi o que eu encontrei em minha base de dados:');
            this.addRemoteMessage(res.response.answer);

            break;

          case environment.typeMessages.not_found:
            // Resposta não encontrada
            this.addRemoteMessage('Não foi possível encontrar uma resposta na minha base de dados. Estou enviando essa pergunta para que um professor possa responder o quanto antes. Tente perguntar novamente em algum tempo!');

            break;

          case environment.typeMessages.not_allowed:
            // Fora de contexto
            this.addRemoteMessage('Sinto muito, essa pergunta está fora de contexto no momento. Tente perguntar algo relacionado a aula.');

            break;

          default:
            if (res.type !== environment.typeMessages.util) {
              // Não encontrou resposta ou houve algum problema
              this.addRemoteMessage('Sinto muito, houve algum problema...');
            }

            break;
        }
      }, (error: any) => {
        console.log('error', error);
        if (error?.error?.response?.errorType === 'No Result!') {
          this.addRemoteMessage('Não foi possível encontrar uma resposta na minha base de dados. Estou enviando essa pergunta para que um professor possa responder o quanto antes. Tente perguntar novamente em algum tempo!');
        } else {
          this.addRemoteMessage('Sinto muito, houve algum problema...');
        }
      });

      this.conversation.push({ class: 'local-message', text: this.localMessage });
      this.localMessage = '';

      setTimeout(() => {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight + 1000;
      }, 100);
    }
  }

}

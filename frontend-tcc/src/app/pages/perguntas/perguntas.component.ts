import { Component, OnInit, ViewChild } from '@angular/core';
import { PoTableColumn, PoTableAction, PoModalComponent, PoModalAction } from '@po-ui/ng-components';
import { PerguntasService } from './perguntas.service';

@Component({
  selector: 'app-perguntas',
  templateUrl: './perguntas.component.html',
  styleUrls: ['./perguntas.component.css']
})
export class PerguntasComponent implements OnInit {

  public items: any = [];

  public columns: PoTableColumn[] = [
    { property: 'question', label: 'Pergunta' }
  ];

  public actions: Array<PoTableAction> = [
    { label: 'Responder', icon: 'po-icon-edit', action: this.responder.bind(this) },
    { label: 'Remover', icon: 'po-icon-delete', action: this.remover.bind(this) }
  ];

  public responderModalConfirm: PoModalAction = {
    action: () => this.confirmAnswer(),
    label: 'Confirmar'
  };

  public removerModalConfirm: PoModalAction = {
    action: () => this.confirmRemover(),
    label: 'Confirmar'
  };

  public selectedQuestion: any = {};

  @ViewChild('responder', { static: true}) responderModal: PoModalComponent;
  @ViewChild('remover', { static: true}) removerModal: PoModalComponent;

  constructor(
    private perguntasService: PerguntasService
  ) { }

  ngOnInit(): void {
    this.loadTable();
  }

  loadTable() {
    this.perguntasService.findAll().subscribe(res => {
      console.log('load table', res);
      this.items = res;
    });
  }

  responder(item) {
    this.selectedQuestion = item;
    this.responderModal.open();
  }

  remover(item) {
    this.selectedQuestion = item;
    this.removerModal.open();
  }

  confirmAnswer() {

    const { _id: id, question, keywords, answer } = this.selectedQuestion;

    this.perguntasService.store(question, keywords, answer).subscribe(storeRes => {
      this.perguntasService.delete(id).subscribe(deleteRes => {
        this.loadTable();
        this.responderModal.close();
      });
    });
  }

  confirmRemover() {
    console.log(this.selectedQuestion);
    this.removerModal.close();
  }

}

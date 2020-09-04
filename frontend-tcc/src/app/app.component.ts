import { Component } from '@angular/core';

import { PoMenuItem } from '@po-ui/ng-components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public user = {
    username: 'Víctor Cândido',
    email: 'victor.candido@iv2.com.br'
  };

  readonly menus: Array<PoMenuItem> = [
    { label: 'Home', shortLabel: 'Home', icon: 'po-icon-home' },
    { label: 'Calendário', shortLabel: 'Calendário', icon: 'po-icon-calendar' },
    { label: 'Chat', shortLabel: 'Chat', icon: 'po-icon-chat', link: 'materias' },
    { label: 'Perguntas', shortLabel: 'Perguntas', icon: 'po-icon-help', link: 'perguntas' },
    { label: 'Painel de Controle', shortLabel: 'Controle', icon: 'po-icon-settings' },
  ];

  private onClick() {
    alert('Clicked in menu item')
  }

}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PoModule } from '@po-ui/ng-components';
import { RouterModule } from '@angular/router';
import { MateriasComponent } from './pages/materias/materias.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { PerguntasComponent } from './pages/perguntas/perguntas.component';


@NgModule({
  declarations: [
    AppComponent,
    MateriasComponent,
    PerguntasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PoModule,
    FormsModule,
    RouterModule.forRoot([]),
    BrowserAnimationsModule,
    MatCardModule,
    MatBadgeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

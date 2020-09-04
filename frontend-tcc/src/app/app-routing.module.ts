import { PerguntasComponent } from './pages/perguntas/perguntas.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MateriasComponent } from './pages/materias/materias.component';


const routes: Routes = [
  { path: 'materias', component: MateriasComponent },
  { path: 'perguntas', component: PerguntasComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

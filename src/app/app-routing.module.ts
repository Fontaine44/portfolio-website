import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutMeComponent } from './about-me/about-me.component';

const routes: Routes = [
  {
    path: 'nhl-data',
    loadChildren: () => import('./nhl-data/nhl-data.module').then(m => m.NhlDataModule)
  },
  {
    path: '',
    component: AboutMeComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

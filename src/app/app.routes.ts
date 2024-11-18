import { Routes } from '@angular/router';
import { AboutMeComponent } from './components/about-me/about-me.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: AboutMeComponent
  },
  {
    path: 'projects',
    loadComponent: () => import('./components/projects/projects.component').then(m => m.ProjectsComponent)
  },
  {
    path: 'shot-map',
    loadComponent: () => import('./components/shot-map/shot-map.component').then(m => m.ShotMapComponent)
  },
  {
    path: 'nhl-data/shot-map',
    redirectTo: 'shot-map',
  },
  {
    path: '**',
    redirectTo: '',
  }
];

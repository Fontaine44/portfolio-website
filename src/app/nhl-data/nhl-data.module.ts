import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ShotMapComponent } from './components/shot-map/shot-map.component';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShotPlotComponent } from './components/shot-map/shot-plot/shot-plot.component';


PlotlyModule.plotlyjs = PlotlyJS;

const routes: Routes = [
  {
    path: '',
    redirectTo: 'shot-map',
    pathMatch: 'full'
  },
  {
    path: 'shot-map',
    component: ShotMapComponent
  },
];

@NgModule({
  declarations: [
    ShotMapComponent,
    ShotPlotComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PlotlyModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [RouterModule]
})
export class NhlDataModule { }

import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-shot-plot',
  templateUrl: './shot-plot.component.html',
  styleUrls: ['./shot-plot.component.scss']
})
export class ShotPlotComponent implements OnInit, OnChanges {
  @Input() loading?: boolean;
  @Input() height?: number;
  @Input() width?: boolean;
  @Input() data?: any;

  x: number[] = [];
  y: number[] = [];
  plotReady = false;

  pointsTrace = {
    x: [] as any[],
    y: [] as any[],
    text: null as any,
    mode: 'markers',
    name: 'scatter',
    opacity: 0.60,
    hovertemplate:
    '%{text.shooterName} <br>'+
    '<i>%{text.shotType}</i><br>' +
    '(%{text.xCordAdjusted},%{text.yCordAdjusted})',
    hoverlabel: {
      namelength: 0
    },
    marker: {
      color: null as any,
      size: 5,
      opacity: 0.9
    },
    type: 'scatter',
  };

  kdeTrace = {
    z: [] as any [],
    name: 'kde',
    autocontour: false,
    hoverinfo: 'skip',
    showscale: false,
    ncontours: 30,
    contours: {
      coloring: 'heatmap',
    },
    line: {
      width: 0
    },
    opacity: 0.80,
    reversescale: true,
    colorscale: 'Hot',
    type: 'contour'
  }

  graph = {
    data: [this.pointsTrace, this.kdeTrace],
    layout: {
      width: this.width,
      height: this.height,
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
      },
      xaxis: {
        domain: [0, 100],
        range: [0, 100],
        visible: false,
        fixedrange: true
      },
      yaxis: {
        domain: [0, 85],
        range: [0, 85],
        visible: false,
        fixedrange: true
      },
      images: [
        {
          source: "../assets/rink.png",
          xref: "x",
          yref: "y",
          x: 0,
          y: 85,
          sizex: 100,
          sizey: 85,
          sizing: "stretch",
          layer: "below"
        }
      ],
    },
    config: {
      displaylogo: false,
      showTips: false,
      toImageButtonOptions: {
        filename: 'shotMapExport',
      },
      modeBarButtonsToRemove: ['lasso2d', 'zoom2d', 'autoScale2d', 'select2d', 'zoomIn2d', 'zoomOut2d', 'pan2d', 'resetScale2d']
    }
  };

  ngOnInit(): void {
    this.graph.layout.width = this.width;
    this.graph.layout.height = this.height;
    this.plotReady = true;
  }

  ngOnChanges(): void {
    if (this.data) {
      this.x = [];
      this.y = [];
      this.data.shots.forEach((val: any) => {
        this.x.push(val["xCordAdjusted"]);
        this.y.push(val["yCordAdjusted"] + 42.5);
      });
      if (this.x.length > 0) {
        this.pointsTrace.marker.color = this.data.shots.map((d: any) => {
          return d["event"] == "GOAL" ? "red" : "black"
        });
      }
      this.pointsTrace.x = this.x;
      this.pointsTrace.y = this.y;
      this.pointsTrace.text = this.data.shots;
      this.kdeTrace.z = this.data.kde;
      this.plotReady = true;
    }
  }
}

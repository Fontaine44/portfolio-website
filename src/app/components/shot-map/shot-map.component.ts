import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { environment } from '../../../environments/environment';
import { ShotPlotComponent } from './shot-plot/shot-plot.component';

@Component({
  selector: 'app-shot-map',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ShotPlotComponent],
  templateUrl: './shot-map.component.html',
  styleUrl: './shot-map.component.scss'
})
export class ShotMapComponent {
  @ViewChild('column') column? : ElementRef;
  @ViewChild('row') row? : ElementRef;

  API = environment.nhlAPI;
  GRAPH_WIDTH: any = null;
  GRAPH_HEIGHT: any = null;
  GRAPH_WIDTH_TEXT!: string;
  GRAPH_HEIGHT_TEXT!: string;

  filtersForm!: FormGroup;
  
  dataReady = false;
  plotReady = false;
  playersReady = false;
  data: any;
  numberShots: undefined | number = undefined; 
  teams: Array<any> = []
  players: Array<any> = []
  games: Array<any> = []
  currentDate: Date = new Date();

  constructor(
    private cdRef: ChangeDetectorRef,
    private httpService: HttpService, 
    private fb: FormBuilder
  ) {
    this.filtersForm = this.fb.group({
      teamCode: 'MTL',
      shooterPlayerId: {value:'', disabled: true},
      gameId: {value:'', disabled: true},
      strength: '',
      event: '',
      shooterLeftRight: '',
      period: ''
    });
    this.fetchData({"teamCode": "MTL"})
    this.loadTeams();
  }

  ngAfterViewInit() {
    this.setHeightWidth();
    this.cdRef.detectChanges();
  }

  setHeightWidth () {
    let h, w;
    w = this.column?.nativeElement.offsetWidth-50;
    h = w*0.85;
    if (h > this.row?.nativeElement.offsetHeight) {
      h = this.row?.nativeElement.offsetHeight-50;
      w = h*1.17;
    }
    this.GRAPH_WIDTH = w;
    this.GRAPH_HEIGHT = h;
    this.GRAPH_WIDTH_TEXT = this.GRAPH_WIDTH.toString()+"px";
    this.GRAPH_HEIGHT_TEXT = this.GRAPH_HEIGHT.toString()+"px";
    this.plotReady = true;
  }

  fetchData(params: object) {
    this.httpService.getWithParameters(`${this.API}/shots?zone=OFF`, params).subscribe({
      next: (v) => {
        this.data = v;
        this.numberShots = v.length;
      },
      error: (e) => console.error(e),
      complete: () => this.enablePlot() 
    });
  }

  enablePlot() {
    this.dataReady = true;
  }

  disablePlot() {
    this.dataReady = false;
  }

  onTeamChange(event: any) {
    const team = this.teams.find(x => x.abbrev == event.target.value);
    this.loadPlayersAndGames(team);
  }

  loadPlayersAndGames(team: any) {
    forkJoin({
      players: this.getPlayers(team),
      games: this.getGames(team)
    }).subscribe({
      next: async (data: any) => {
        await this.parsePlayers(data.players);
        await this.parseGames(data.games);
      },
      error: (e) => console.error(e),
      complete: () => {
        this.filtersForm.get('gameId')?.enable();
        this.filtersForm.get('shooterPlayerId')?.enable();
      }
    });
  }

  loadTeams() {
    this.httpService.get(`${this.API}/teams`).subscribe({
      next: (data) => {
        data.teams.forEach((team: any) => {
          this.teams.push({
            id: team.id,
            abbrev: team.triCode,
            name: team.fullName,
          });
        });
      },
      error: (e) => console.error(e),
      complete: () => this.loadPlayersAndGames(this.teams.find(x => x.abbrev == "MTL")) 
    });
  }

  getPlayers(team: any): Observable<any> {
    this.filtersForm.get('shooterPlayerId')?.disable();
    this.filtersForm.get('shooterPlayerId')?.setValue('');
    this.players = [];
    return this.httpService.get(`${this.API}/players/${team.abbrev}`);
  }

  getGames(team: any): Observable<any> {
    this.filtersForm.get('gameId')?.disable();
    this.filtersForm.get('gameId')?.setValue('');
    this.games = [];
    return this.httpService.get(`${this.API}/games/${team.abbrev}`);
  }

  async parsePlayers(players: any) {
    players.forwards.forEach((player: any) => {
      this.players.push({
        id: player.id,
        name: player.firstName.default + " " + player.lastName.default,
      });
    });
    players.defensemen.forEach((player: any) => {
      this.players.push({
        id: player.id,
        name: player.firstName.default + " " + player.lastName.default,
      });
    });
    this.players.sort((a: any, b: any) => a.name.split(" ")[1].localeCompare(b.name.split(" ")[1]));  // Alphabetical order
  }

  async parseGames(games: any) {
    games.games.forEach((game: any) => {
      if (game.gameType == 2 && (new Date(game.gameDate)) < this.currentDate) {
        this.games.push({
          id: game.id,
          date: game.gameDate,
          teamHome: game.homeTeam.abbrev,
          teamAway: game.awayTeam.abbrev,
        });
      }
    });
  }

  resetForm() {
    const previousTeam = this.filtersForm.get('teamCode')?.value;
    this.filtersForm.reset({
      teamCode: 'MTL',
      strength: '',
      shooterLeftRight: '',
      period: ''
    });
    if (previousTeam != 'MTL') {
      this.loadPlayersAndGames(this.teams.find(x => x.abbrev == "MTL"));
    };
  }

  onFormSubmit() {
    this.disablePlot();
    let params: any = {};
    this.filtersForm.get('event')?.setValue(this.filtersForm.get('event')?.value ? 'GOAL' : '');

    for (const field in this.filtersForm.controls) {    // Get clean fields
      let val = this.filtersForm.get(field)?.value;
      if (val) {
        params[field] = val;
      };
    }

    const longGameId = params.gameId;
    if (longGameId) {
      params.gameId = parseInt(longGameId.substring(4));
    }

    this.fetchData(params);
  }
}

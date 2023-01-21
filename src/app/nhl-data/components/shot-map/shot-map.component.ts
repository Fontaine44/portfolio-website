import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpService } from 'src/app/shared/services/http.service';


@Component({
  selector: 'app-shot-map',
  templateUrl: './shot-map.component.html',
  styleUrls: ['./shot-map.component.scss']
})
export class ShotMapComponent implements AfterViewInit {

  @ViewChild('column') column? : ElementRef;
  @ViewChild('row') row? : ElementRef;

  GRAPH_WIDTH: any = null;
  GRAPH_HEIGHT: any = null;
  GRAPH_WIDTH_TEXT!: string;
  GRAPH_HEIGHT_TEXT!: string;

  filtersForm: FormGroup = this.fb.group({
    teamId: '',
    playerId: {value:'', disabled: true},
    gameId: {value:'', disabled: true},
    strength: '',
    eventTypeId: '',
    defensiveSide: false,
  });
  
  dataReady = false;
  plotReady = false;
  playersReady = false;
  data: any;
  teams: Array<any> = []
  players: Array<any> = []
  games: Array<any> = []

  constructor( private cdRef:ChangeDetectorRef, private httpService: HttpService,  private fb: FormBuilder) {
    this.fetchData({})
    this.loadTeams();
  }

  ngAfterViewInit() {
    this.setHeightWidth();
    this.cdRef.detectChanges();
  }

  setHeightWidth () {
    let h, w;
    w = this.row?.nativeElement.offsetWidth-20;
    h = w*0.85;
    if (h > this.column?.nativeElement.offsetHeight) {
      h = this.column?.nativeElement.offsetHeight-20;
      w = h*1.17;
    }
    this.GRAPH_WIDTH = w;
    this.GRAPH_HEIGHT = h;
    this.GRAPH_WIDTH_TEXT = this.GRAPH_WIDTH.toString()+"px";
    this.GRAPH_HEIGHT_TEXT = this.GRAPH_HEIGHT.toString()+"px";
    this.plotReady = true;
  }

  fetchData(params: object) {
    this.httpService.httpGetWithParameters("https://fontaine.onrender.com/shots", params).subscribe({
      next: (v) => {
        this.data = v;
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

  loadTeams() {
    this.httpService.httpGet("https://statsapi.web.nhl.com/api/v1/teams").subscribe({
      next: (data) => {
        data.teams.forEach((team: any) => {
          this.teams.push({
            id: team.id,
            name: team.name,
            link: team.link,
          });
        })
      },
      error: (e) => console.error(e),
      complete: () => console.log() 
    });
  }

  loadPlayers(event: any) {
    this.players = [];
    this.filtersForm.get('playerId')?.disable();
    this.filtersForm.get('playerId')?.setValue('');
    const teamId = parseInt(event.target.value);
    const team = this.teams.find(x => x.id == teamId);
    this.httpService.httpGet("https://statsapi.web.nhl.com"+team.link+"/roster").subscribe({
      next: (data) => {
        data.roster.forEach((player: any) => {
          this.players.push({
            id: player.person.id,
            name: player.person.fullName,
          });
        })
      },
      error: (e) => console.error(e),
      complete: () => this.filtersForm.get('playerId')?.enable()
    });
  }

  loadGames(event: any) {
    this.filtersForm.get('gameId')?.disable();
    this.filtersForm.get('gameId')?.setValue('');
    this.games = [];
    const teamId = parseInt(event.target.value);
    this.httpService.httpGet("https://statsapi.web.nhl.com/api/v1/schedule?season=20222023&gameType=R&teamId="+teamId).subscribe({
      next: (data) => {
        data.dates.forEach((game: any) => {
          if (game.games[0].status.statusCode == 7) {
            this.games.push({
              id: game.games[0].gamePk,
              date: game.date,
              teamHome: game.games[0].teams.home.team.name,
              teamAway: game.games[0].teams.away.team.name,
            });
          }
        })
      },
      error: (e) => console.error(e),
      complete: () => this.filtersForm.get('gameId')?.enable()
    });
  }

  resetForm() {
    this.filtersForm.reset();
    this.players = [];
    this.filtersForm.get('playerId')?.disable();
    this.filtersForm.get('gameId')?.disable();
  }

  onFormSubmit() {
    this.disablePlot();
    let params: any = {};
    this.filtersForm.get('eventTypeId')?.setValue(this.filtersForm.get('eventTypeId')?.value? 'GOAL' : '');
    for (const field in this.filtersForm.controls) {    // Get clean fields
      let val = this.filtersForm.get(field)?.value;
      if (val) {
        params[field] = val;
      };
    }
    this.fetchData(params);
  }
}

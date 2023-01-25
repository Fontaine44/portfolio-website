import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
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
    teamCode: 'MTL',
    shooterPlayerId: {value:'', disabled: true},
    gameId: {value:'', disabled: true},
    strength: '',
    event: '',
    shooterLeftRight: ''
  });
  
  dataReady = false;
  plotReady = false;
  playersReady = false;
  data: any;
  numberShots: undefined | number = undefined; 
  teams: Array<any> = []
  players: Array<any> = []
  games: Array<any> = []

  constructor( private cdRef:ChangeDetectorRef, private httpService: HttpService,  private fb: FormBuilder) {
    this.fetchData({"teamCode": "MTL"})
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
    this.httpService.httpGetWithParameters("http://localhost:5000/shots?zone=OFF", params).subscribe({
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
    this.httpService.httpGet("https://statsapi.web.nhl.com/api/v1/teams").subscribe({
      next: (data) => {
        data.teams.forEach((team: any) => {
          this.teams.push({
            id: team.id,
            abbrev: team.abbreviation,
            name: team.name,
            link: team.link,
          });
        });
        this.teams.sort((a: any, b: any) => a.name.localeCompare(b.name));  // Alphabetical order
      },
      error: (e) => console.error(e),
      complete: () => this.loadPlayersAndGames(this.teams.find(x => x.abbrev == "MTL")) 
    });
  }

  getPlayers(team: any): Observable<any> {
    this.filtersForm.get('shooterPlayerId')?.disable();
    this.filtersForm.get('shooterPlayerId')?.setValue('');
    this.players = [];
    return this.httpService.httpGet("https://statsapi.web.nhl.com"+team.link+"/roster");
  }

  getGames(team: any): Observable<any> {
    this.filtersForm.get('gameId')?.disable();
    this.filtersForm.get('gameId')?.setValue('');
    this.games = [];
    return this.httpService.httpGet("https://statsapi.web.nhl.com/api/v1/schedule?season=20222023&gameType=R&teamId="+team.id.toString());
  }

  async parsePlayers(players: any) {
    players.roster.forEach((player: any) => {
      this.players.push({
        id: player.person.id,
        name: player.person.fullName,
      });
    });
    this.players.sort((a: any, b: any) => a.name.split(" ")[1].localeCompare(b.name.split(" ")[1]));  // Alphabetical order
  }

  async parseGames(games: any) {
    games.dates.forEach((game: any) => {
      if (game.games[0].status.statusCode == 7) {
        this.games.push({
          id: game.games[0].gamePk,
          date: game.date,
          teamHome: game.games[0].teams.home.team.name,
          teamAway: game.games[0].teams.away.team.name,
        });
      }
    });
  }

  resetForm() {
    const previousTeam = this.filtersForm.get('teamCode')?.value;
    this.filtersForm.reset({teamCode: 'MTL'});
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

import { HttpClient, HttpParams } from  '@angular/common/http';
import { Injectable } from  '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  get(url: string) : Observable<any> {
    return this.http.get(url);
  }

  getWithParameters(url: string, params: any) : Observable<any> {
    let queryParams = new HttpParams({ fromObject: params });
    return this.http.get(url, { params: queryParams})
  }

  post(url: string, body: any | null) : Observable<any> {
    return this.http.post(url, body);
  }
}

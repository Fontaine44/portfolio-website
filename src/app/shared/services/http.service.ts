import { HttpClient, HttpParams } from  '@angular/common/http';
import { Injectable } from  '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  httpGet(url: string) : Observable<any> {
    return this.http.get(url);
  }

  httpGetWithParameters(url: string, params: any) : Observable<any> {
    let queryParams = new HttpParams({ fromObject: params });
    return this.http.get(url, { params: queryParams})
  }
}

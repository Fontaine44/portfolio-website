import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AlertType = 'success' | 'danger' | 'warning' | 'info';

export interface Alert {
  type: AlertType;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  alerts$ = this.alertsSubject.asObservable();

  constructor() { }

  // Add an alert
  addAlert(type: AlertType, message: string) {
    const currentAlerts = this.alertsSubject.value;
    this.alertsSubject.next([...currentAlerts, { type, message }]);
  }

  // Remove a specific alert (by message)
  removeAlert(alertToRemove: Alert) {
    const currentAlerts = this.alertsSubject.value.filter(alert => alert !== alertToRemove);
    this.alertsSubject.next(currentAlerts);
  }

  // Clear all alerts
  clearAlerts() {
    this.alertsSubject.next([]);
  }
}

import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private hubConnection!: signalR.HubConnection;
    private apiUrl = environment.api_base + '/notificationHub';
    private localAPIUrl = 'https://localhost:7264/notificationHub'; 

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.apiUrl, {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('SignalR Error: ', err));
  }

  onNotification(callback: (data: any) => void) {
    this.hubConnection.on('ReceiveNotification', callback);
  }
}
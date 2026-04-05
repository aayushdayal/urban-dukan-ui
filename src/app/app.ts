import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LandingComponent } from './landing/landing';
import { HeaderComponent } from "./header/header";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { SignalRService } from './services/signalr.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LandingComponent, HeaderComponent, HttpClientModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('urban-dukan-ui');
 constructor(private signalRService: SignalRService) {}

  ngOnInit(): void {
   // alert(`Order $ placed successfully`);
    this.signalRService.startConnection();

    this.signalRService.onNotification((data) => {
      console.log('Notification received:', data);

      alert(`Message received from Azure service bus for Order ${data.orderId} being placed successfully`);
    });
   // alert(`Order $dkashdjcessfully`);

  }
}

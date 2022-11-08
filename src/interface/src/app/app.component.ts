import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  sidebarOpen = false;

  constructor(private authService: AuthService) {}

  toggleSidebar(event: Event) {
    this.sidebarOpen = !this.sidebarOpen;
  }

  ngOnInit(): void {
    // Refresh the user's logged in status when the app initializes.
    this.authService.refreshToken().pipe(take(1)).subscribe();
  }

}

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './../services';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

  error: any;

  model: any = {};

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  onSubmit() {
    this.signup(this.model.username, this.model.email, this.model.password1, this.model.password2);
  }

  signup(username: string, email: string, password1: string, password2: string) {
    this.authService.signup(username, email, password1, password2).subscribe(
      _ => this.router.navigate(['map']),
      error => this.error = error
    );
  }

  login() {
    this.router.navigate(['login']);
  }

}

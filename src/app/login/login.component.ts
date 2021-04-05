import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @Output() isLogIn = new EventEmitter<void>();

  constructor(public firebaseService: FirebaseService) { }

  isSignedIn = false;
  ngOnInit(): void {
    if (localStorage.getItem('user') != null) {
      this.isSignedIn = true;
    }
    else {
      this.isSignedIn = false;
    }
  }

  async onSignUp(email: string, pass: string) {
    await this.firebaseService.signup(email, pass);
    if (this.firebaseService.isLoggedIn) {
      this.isSignedIn = true;
      this.isLogIn.emit();

    }
  }

  async onSignIn(email: string, pass: string) {
    await this.firebaseService.signin(email, pass);
    if (this.firebaseService.isLoggedIn) {
      this.isSignedIn = true;
      this.isLogIn.emit();
    }
  }

  alertThem() {
    alert("Password must containing atleast 6 character and Username must be valid");
  }
  handleLogOut() {
    this.isSignedIn = false;
  }

}

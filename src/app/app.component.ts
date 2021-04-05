import { Component, OnInit } from '@angular/core';
import { FirebaseService } from './services/firebase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'MyApp';

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

  handleLogOut(): void {
    this.isSignedIn = false;
  }

  handleLogIn(): void {
    this.isSignedIn = true;
  }
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-code',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './code.html',
  styleUrls: ['./code.scss']
})
export class Code {
  code: string = ''; // input from user
  message: string = ''; // feedback

  constructor(private router: Router) {}

  onVerify() {
    // get stored resetUser object
    const resetUserData = localStorage.getItem('resetUser');

    if (!resetUserData) {
      this.message = 'No reset request found. Please try again.';
      alert(this.message);
      this.router.navigate(['/forgotpassword']);
      return;
    }

    const resetUser = JSON.parse(resetUserData);
    console.log('Stored resetUser:', resetUser);

    if (this.code === resetUser.verificationCode.toString()) {
      this.message = 'Code verified successfully!';
      alert(this.message);

      // optionally store a flag to allow reset page access
      localStorage.setItem('verifiedUser', JSON.stringify(resetUser));

      this.router.navigate(['/resetpassword']);
    } else {
      this.message = 'Invalid verification code!';
      alert(this.message);
    }
  }
  goToForgot() {
  this.router.navigate(['/forgotpassword']);
}

}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './resetpassword.html', // <-- matches your actual file name
  styleUrls: ['./resetpassword.scss']
})

export class Resetpassword {
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onResetPassword() {
    const verifiedUserData = localStorage.getItem('verifiedUser');

    if (!verifiedUserData) {
      this.message = 'Unauthorized access. Please request a reset again.';
      alert(this.message);
      this.router.navigate(['/forgotpassword']);
      return;
    }

    const verifiedUser = JSON.parse(verifiedUserData);

    if (!this.newPassword || !this.confirmPassword) {
      this.message = 'Please fill in all fields.';
      alert(this.message);
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.message = 'Passwords do not match!';
      alert(this.message);
      return;
    }

    const payload = {
      idUser: verifiedUser.idUser,
      newPassword: this.newPassword
    };

    console.log('Sending reset payload:', payload);

    this.http.post<any>('http://localhost/MailDoctor/backend/reset_password.php', payload)
      .subscribe({
        next: (res) => {
          console.log('Reset password response:', res);
          if (res.success) {
            this.message = 'Password reset successful!';
            alert(this.message);

            localStorage.removeItem('resetUser');
            localStorage.removeItem('verifiedUser');

            this.router.navigate(['/']);
          } else {
            this.message = res.message || 'Failed to reset password.';
            alert(this.message);
          }
        },
        error: (err) => {
          console.error('HTTP error:', err);
          this.message = 'An error occurred. Please try again.';
          alert(this.message);
        }
      });
  }
  goToLogin() {
  this.router.navigate(['/']);
}



}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    this.errorMessage = '';

    const payload = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>('http://localhost/MailDoctor/backend/login.php', payload)
      .subscribe({
        next: (res) => {
          if (res.success) {
            // ✅ Clear uploads first
            this.http.get('http://localhost/MailDoctor/backend/clear_uploads.php')
              .subscribe({
                next: () => {
                  console.log('Uploads cleared successfully.');
                },
                error: (err) => {
                  console.error('Error clearing uploads on login:', err);
                  // Not critical → continue anyway
                },
                complete: () => {
                  // ✅ Proceed with login flow after cleanup
                  localStorage.setItem('user', JSON.stringify(res.user));
                  alert('Login successful! Welcome, ' + res.user.username);
                  this.router.navigate([res.redirect]);
                }
              });
          } else {
            this.errorMessage = res.message || 'Login failed';
            alert(this.errorMessage);
          }
        },
        error: (err) => {
          console.error('HTTP Error:', err);
          this.errorMessage = 'Server error. Please try again.';
          alert(this.errorMessage);
        }
      });
  }
}

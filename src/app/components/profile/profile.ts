import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // <-- add this

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule], // <-- include CommonModule
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile {
  username: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {
    this.loadUser();
  }

  loadUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.username = user.username;
    }
  }

  updateProfile() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    const payload = { username: this.username, password: this.newPassword };

    this.http.post<any>('http://localhost/MailDoctor/backend/update_profile.php', payload)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.successMessage = 'Profile updated successfully!';
            this.newPassword = '';
            this.confirmPassword = '';
          } else {
            this.errorMessage = res.message || 'Update failed';
          }
        },
        error: (err) => {
          console.error('HTTP Error:', err);
          this.errorMessage = 'Server error. Please try again.';
        }
      });
  }
}

import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss'],
  standalone: true,
  imports: [FormsModule, HttpClientModule]
})
export class Signup {
  private signupUrl = 'http://localhost/MailDoctor/backend/signup.php';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      const { username, email, password, confirm_password } = form.value;

      if (password !== confirm_password) {
        alert('Passwords do not match.');
        return;
      }

      this.http.post(this.signupUrl, { username, email, password }).subscribe({
        next: (response: any) => {
          if (response.success) {
            alert('User registered successfully!');
            form.reset();
            // ✅ Redirect to login after success
            this.router.navigate(['/']);
          } else {
            alert(response.message);
          }
        },
        error: (err) => {
          console.error('HTTP Error:', err);
          alert('Error communicating with server. Check console for details.');
        }
      });
    } else {
      alert('Please fill out all required fields.');
    }
  }
}

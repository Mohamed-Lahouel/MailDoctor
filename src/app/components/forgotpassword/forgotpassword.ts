import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './forgotpassword.html',
  styleUrls: ['./forgotpassword.scss']
})
export class Forgotpassword {
  email: string = ''; // Input email
  message: string = ''; // Feedback message to display

  constructor(private http: HttpClient, private router: Router) {}

  resetPassword() {
    if (!this.email) {
      this.message = 'Please enter your email.';
      alert('Please enter your email.');
      return;
    }

    // Step 1: Check if user exists
    const checkPayload = { email: this.email };
    console.log('Checking user:', checkPayload);

    this.http.post<any>('http://localhost/MailDoctor/backend/check_user.php', checkPayload)
      .subscribe({
        next: (res) => {
          console.log('Check user response:', res);
          if (res.success) {
            const idUser = res.idUser;

            // Step 2: Generate verification code
            const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code
            console.log('Generated verification code:', verificationCode);

            // Step 3: Prepare email payload
            const emailPayload = { email: this.email, idUser, verificationCode };
            console.log('Payload sent to send_email.php:', emailPayload);

            // Step 4: Send email
            this.http.post<any>('http://localhost/MailDoctor/backend/send_email.php', emailPayload)
              .subscribe({
                next: (emailRes) => {
                  console.log('Email response:', emailRes);
                  if (emailRes.success) {
                    this.message = 'Verification code sent! Check your email.';
                    alert('Verification code sent! Check your email.');

                    // ✅ Save user info + code in localStorage
                    localStorage.setItem('resetUser', JSON.stringify({
                      idUser,
                      email: this.email,
                      verificationCode
                    }));

                    // ✅ Redirect to verify-code page
                    this.router.navigate(['/code']);
                  } else {
                    this.message = `Error sending email: ${emailRes.message}`;
                    alert(`Error sending email: ${emailRes.message}`);
                  }
                },
                error: (err) => {
                  console.error('Email HTTP Error:', err);
                  this.message = 'Failed to send email. Please try again.';
                  alert('Failed to send email. Please try again.');
                }
              });

          } else {
            this.message = res.message || 'User does not exist.';
            alert(this.message);
          }
        },
        error: (err) => {
          console.error('Check user HTTP Error:', err);
          this.message = 'An error occurred. Please try again.';
          alert('An error occurred. Please try again.');
        }
      });
  }
}

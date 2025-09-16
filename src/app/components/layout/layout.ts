import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule], // <-- import HttpClientModule
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class Layout {
  constructor(private router: Router, private http: HttpClient) {} // <-- inject HttpClient

  goTo(route: string) {
    this.router.navigate([`/layout/${route}`]);
  }

  logout() {
    // Call PHP to clear uploads
    this.http.get('http://localhost/MailDoctor/backend/clear_uploads.php')
      .subscribe({
        next: () => {
          // Clear localStorage and navigate after cleaning
          localStorage.removeItem('user');
          this.router.navigate(['/']);
        },
        error: (err: any) => { // <-- type the error parameter
          console.error('Error clearing uploads:', err);
          // Still logout even if cleaning fails
          localStorage.removeItem('user');
          this.router.navigate(['/']);
        }
      });
  }
}

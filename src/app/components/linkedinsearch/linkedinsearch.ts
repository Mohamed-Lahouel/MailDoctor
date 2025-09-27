import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-linkedin-search',   // update selector
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './linkedinsearch.html',
  styleUrls: ['./linkedinsearch.scss']
})
export class LinkedinSearch {         // rename class
  searchTerm: string = '';
  linkedinResults: any[] = [];
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private http: HttpClient) {}

  async fetchLinkedInUrls() {
    this.errorMessage = '';
    this.linkedinResults = [];
    this.loading = true;

    try {
      const data: any = await lastValueFrom(
        this.http.post(`http://127.0.0.1:8000/api/find-linkedin`, {
          queries: this.searchTerm
        })
      );

      if (data.results && data.results.length > 0) {
        this.linkedinResults = data.results;
      } else {
        this.errorMessage = data.error || 'No LinkedIn profiles found.';
      }
    } catch (err) {
      console.error('Fetch error:', err);
      this.errorMessage = 'Error fetching LinkedIn URLs. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}

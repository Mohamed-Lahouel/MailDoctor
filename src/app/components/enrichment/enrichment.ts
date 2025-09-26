import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-enrichment',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './enrichment.html',
  styleUrls: ['./enrichment.scss']
})
export class Enrichment {
  searchTerm: string = '';
  linkedinResults: any[] = [];
  selectedResult: any = null;
  foundEmail: string = '';
  dataset: { url: string; email: string }[] = [];
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private http: HttpClient) {}

  async fetchLinkedInUrls() {
    this.errorMessage = '';
    this.linkedinResults = [];
    this.selectedResult = null;
    this.foundEmail = '';
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

  selectResult(result: any) {
    this.selectedResult = result;
    this.foundEmail = ''; // reset email when selecting a new row
  }

  async findEmail() {
    if (!this.selectedResult) return;

    // Placeholder: simulate email finding
    this.foundEmail = `contact@${new URL(this.selectedResult.url).hostname}`;
  }

  addToDataset() {
    if (this.selectedResult && this.foundEmail) {
      const exists = this.dataset.some(item => item.url === this.selectedResult.url);
      if (!exists) {
        this.dataset.push({ url: this.selectedResult.url, email: this.foundEmail });
      }
    }
  }
}

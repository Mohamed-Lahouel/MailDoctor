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
  firstName: string = '';
  lastName: string = '';
  domain: string = '';
  foundEmail: string = '';
  score: number | null = null;
  position: string | null = null;
  company: string | null = null;
  errorMessage: string = '';
  loading: boolean = false;
  dataset: { firstName: string; lastName: string; email: string; company: string | null }[] = [];

  private hunterApiKey = '4b411764cdc2860e7caf6f5568ee1bfe9dfae2f6'; // replace with your key

  constructor(private http: HttpClient) {}

  async findEmail() {
    this.errorMessage = '';
    this.foundEmail = '';
    this.score = null;
    this.position = null;
    this.company = null;

    if (!this.firstName || !this.lastName || !this.domain) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.loading = true;
    try {
      const url = `https://api.hunter.io/v2/email-finder?domain=${this.domain}&first_name=${this.firstName}&last_name=${this.lastName}&api_key=${this.hunterApiKey}`;

      const data: any = await lastValueFrom(this.http.get(url));

      if (data?.data?.email) {
        this.foundEmail = data.data.email;
        this.score = data.data.score;
        this.position = data.data.position;
        this.company = data.data.company;
      } else {
        this.errorMessage = 'No email found for this person.';
      }
    } catch (err) {
      console.error('Hunter API error:', err);
      this.errorMessage = 'Failed to fetch email. Try again later.';
    } finally {
      this.loading = false;
    }
  }

  addToDataset() {
    if (this.foundEmail) {
      const exists = this.dataset.some(
        item => item.email === this.foundEmail && item.firstName === this.firstName
      );
      if (!exists) {
        this.dataset.push({
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.foundEmail,
          company: this.company
        });
      }
    }
  }
}

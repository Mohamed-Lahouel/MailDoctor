import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type OptionKey = 'removeEmpty' | 'trimWhitespace' | 'normalizeCase' | 'removePlaceholders' | 'removeDuplicates';

@Component({
  selector: 'app-cleaning',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './cleaning.html',
  styleUrls: ['./cleaning.scss']
})
export class Cleaning implements OnInit {

  uploadedFiles: string[] = [];
  selectedFile: string = '';

  options: Record<OptionKey, boolean> = {
    removeEmpty: true,
    trimWhitespace: true,
    normalizeCase: true,
    removePlaceholders: true,
    removeDuplicates: true
  };

  optionKeys: OptionKey[] = Object.keys(this.options) as OptionKey[];

  optionLabels: Record<OptionKey, string> = {
    removeEmpty: 'Remove empty rows',
    trimWhitespace: 'Trim whitespace',
    normalizeCase: 'Normalize case',
    removePlaceholders: 'Remove placeholders',
    removeDuplicates: 'Remove duplicates'
  };

  cleaningResult: any = null;
  loadingFiles: boolean = false;
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUploadedFiles();
  }

  loadUploadedFiles() {
    this.loadingFiles = true;
    this.errorMessage = '';

    // Use full URL to XAMPP backend or proxy
    this.http.get<string[]>('http://localhost/MailDoctor/backend/list_csvs.php')
      .subscribe({
        next: (files) => {
          this.uploadedFiles = files;
          this.selectedFile = this.uploadedFiles[0] || '';
          this.loadingFiles = false;
        },
        error: (err) => {
          console.error('Error loading CSV files', err);
          this.errorMessage = 'Failed to load CSV files. Check backend.';
          this.loadingFiles = false;
        }
      });
  }

  cleanFile() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('filename', this.selectedFile);

    this.optionKeys.forEach((key) => {
      formData.append(key, this.options[key].toString());
    });

    this.cleaningResult = null;

    this.http.post<any>('http://localhost/MailDoctor/backend/clean_csv.php', formData)
      .subscribe({
        next: (res) => {
          this.cleaningResult = res;
        },
        error: (err) => {
          console.error('Error cleaning file', err);
          this.cleaningResult = { error: 'Failed to clean CSV. Check backend.' };
        }
      });
  }

}

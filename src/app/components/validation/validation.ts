import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ValidationKey = 'syntax' | 'domain' | 'smtp';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './validation.html',
  styleUrls: ['./validation.scss']
})
export class Validation implements OnInit {

  uploadedFiles: string[] = [];
  selectedFile: string = '';

  // Match FastAPI parameters
  validationOptions: Record<ValidationKey, boolean> = {
    syntax: true,
    domain: true,
    smtp: false
  };

  validationKeys: ValidationKey[] = Object.keys(this.validationOptions) as ValidationKey[];

  validationLabels: Record<ValidationKey, string> = {
    syntax: 'Regex Syntax Check',
    domain: 'Typo / Domain Check',
    smtp: 'SMTP Deliverability Test'
  };

  validationResult: any = null;
  loadingFiles: boolean = false;
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUploadedFiles();
  }

  loadUploadedFiles() {
    this.loadingFiles = true;
    this.errorMessage = '';

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

  validateFile() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('filename', this.selectedFile);

    // Append only parameters expected by FastAPI
    formData.append('syntax', this.validationOptions.syntax.toString());
    formData.append('domain', this.validationOptions.domain.toString());
    formData.append('smtp', this.validationOptions.smtp.toString());

    this.validationResult = null;

    this.http.post<any>('http://127.0.0.1:8000/validate_csv', formData)
      .subscribe({
        next: (res) => {
          this.validationResult = res;

          if (res.success) {
            setTimeout(() => {
              const element = document.getElementById('resultSection');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        },
        error: (err) => {
          console.error('Error validating file', err);
          this.validationResult = { error: 'Failed to validate CSV. Check FastAPI server.' };
        }
      });
  }
}

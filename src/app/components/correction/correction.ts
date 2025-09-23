import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-correction',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './correction.html',
  styleUrls: ['./correction.scss']
})
export class Correction implements OnInit {
  uploadedFiles: string[] = [];
  selectedFile: string = '';
  correctionResult: any = null;
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUploadedFiles();
  }

  loadUploadedFiles() {
    this.http.get<string[]>('http://localhost/MailDoctor/backend/list_csvs.php')
      .subscribe({
        next: (files) => {
          this.uploadedFiles = files;
          this.selectedFile = this.uploadedFiles[0] || '';
        },
        error: () => this.errorMessage = 'Failed to load CSV files.'
      });
  }

  correctFile() {
    if (!this.selectedFile) return;
    const formData = new FormData();
    formData.append('filename', this.selectedFile);

    this.http.post<any>('http://127.0.0.1:8000/correct_csv', formData)
      .subscribe({
        next: (res) => this.correctionResult = res,
        error: () => this.errorMessage = 'Correction failed. Check FastAPI server.'
      });
  }
}

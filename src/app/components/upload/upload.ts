import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [NgFor, NgIf, HttpClientModule], // ✅ Only import modules here
  templateUrl: './upload.html',
  styleUrls: ['./upload.scss']
})
export class Upload {
  selectedFiles: File[] = [];
  uploadedFiles: string[] = [];

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  uploadFiles() {
    if (this.selectedFiles.length === 0) return;

    const formData = new FormData();
    this.selectedFiles.forEach(file => formData.append('files[]', file));

    this.http.post<any>('http://localhost/MailDoctor/backend/upload_files.php', formData)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.uploadedFiles = res.files;
            this.selectedFiles = [];
          } else {
            alert('Failed to upload files.');
          }
        },
        error: (err) => console.error('Upload error:', err)
      });
  }

  clearUploads() {
    this.http.get('http://localhost/MailDoctor/backend/clear_uploads.php')
      .subscribe(() => {
        this.uploadedFiles = [];
      });
  }
}

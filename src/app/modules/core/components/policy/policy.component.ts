import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '@env/environment';

@Component({
  selector: 'heart-policy',
  template: `<div class="p-3 policy" [innerHTML]="policyHtml"></div>`,
  styleUrls: ['./policy.component.scss'],
})
export class PolicyComponent {
  policyHtml!: SafeHtml;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    const policyFile = `./assets/policy/privacy-policy-${environment.defaultLanguage}.html`;

    this.http.get(policyFile, { responseType: 'text' }).subscribe({
      next: (html) => {
        this.policyHtml = this.sanitizer.bypassSecurityTrustHtml(html);
      },
      error: (err) => {
        this.policyHtml = this.sanitizer.bypassSecurityTrustHtml(
          '<p class="error">No privacy policy found.</p>',
        );
        // Optionally log the error or handle it further
        console.error('Failed to load policy file:', err);
      },
    });
  }
}

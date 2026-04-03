import { Component, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnDestroy {
  query = '';
  suggestions: string[] = [];
  loading = false;
  showDropdown = false;
  private debounceTimer: any = null;
  private lastRequestSub: Subscription | null = null;
  minLength = 2;
  selectedIndex = -1; // for keyboard navigation

  constructor(
    private searchService: SearchService,
    private router: Router,
    private host: ElementRef,
    private sanitizer: DomSanitizer
  ) {}

  onInput() {
    // reset selection
    this.selectedIndex = -1;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    if (this.query.trim().length < this.minLength) {
      this.suggestions = [];
      this.showDropdown = false;
      // cancel in-flight request
      this.cancelLastRequest();
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.fetchSuggestions(this.query.trim());
    }, 200);
  }

  private fetchSuggestions(q: string) {
    this.cancelLastRequest();
    this.loading = true;
    this.lastRequestSub = this.searchService.autocomplete(q).subscribe({
      next: (res) => {
        this.suggestions = Array.isArray(res) ? res : [];
        this.showDropdown = !!this.suggestions.length;
        this.loading = false;
      },
      error: () => {
        this.suggestions = [];
        this.showDropdown = false;
        this.loading = false;
      }
    });
  }

  private cancelLastRequest() {
    if (this.lastRequestSub) {
      this.lastRequestSub.unsubscribe();
      this.lastRequestSub = null;
    }
  }

  // keyboard support
  onKeyDown(ev: KeyboardEvent) {
    if (!this.showDropdown || !this.suggestions.length) {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        this.triggerSearch();
      }
      return;
    }

    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1);
      this.scrollSelectedIntoView();
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      this.scrollSelectedIntoView();
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      if (this.selectedIndex >= 0) {
        this.selectSuggestion(this.suggestions[this.selectedIndex]);
      } else {
        this.triggerSearch();
      }
    } else if (ev.key === 'Escape') {
      this.closeDropdown();
    }
  }

  private scrollSelectedIntoView() {
    // small timeout to ensure DOM updated
    setTimeout(() => {
      const el = this.host.nativeElement.querySelector('.suggestion.selected');
      if (el) { el.scrollIntoView({ block: 'nearest' }); }
    }, 0);
  }

  selectSuggestion(text: string) {
    this.query = text;
    this.closeDropdown();
    // Trigger full search automatically
    this.triggerSearch();
  }

  triggerSearch() {
    const q = this.query.trim();
    if (!q) return;
    // Call search endpoint (as required) then navigate to results (e.g. products route with query param)
    this.cancelLastRequest();
    this.loading = true;
    this.lastRequestSub = this.searchService.search(q).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/products'], { queryParams: { query: q } });
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/products'], { queryParams: { query: q } });
      }
    });
  }

  clear() {
    this.query = '';
    this.suggestions = [];
    this.showDropdown = false;
    this.selectedIndex = -1;
    this.cancelLastRequest();
    if (this.debounceTimer) { clearTimeout(this.debounceTimer); }
  }

  closeDropdown() {
    this.showDropdown = false;
    this.selectedIndex = -1;
  }

  highlightSuggestion(s: string): SafeHtml {
    if (!this.query) return this.sanitizer.bypassSecurityTrustHtml(s);
    const escaped = this.escapeRegExp(this.query.trim());
    if (!escaped) return this.sanitizer.bypassSecurityTrustHtml(s);
    const re = new RegExp(`(${escaped})`, 'ig');
    const html = s.replace(re, '<mark>$1</mark>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // click outside closes dropdown
  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    if (!this.host.nativeElement.contains(ev.target)) {
      this.closeDropdown();
    }
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) { clearTimeout(this.debounceTimer); }
    this.cancelLastRequest();
  }
}
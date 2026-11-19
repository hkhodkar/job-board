import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApplicationsStore } from './core/stores/applications.store';
import { PostedJobsStore } from './core/stores/posted-jobs.store';
import { SavedJobsStore } from './core/stores/saved-jobs.store';
import { Icon } from './shared/components/icon/icon';
import { Toasts } from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, Toasts],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: { '(document:keydown.escape)': 'closeMenu()' },
})
export class App {
  protected readonly saved = inject(SavedJobsStore);
  protected readonly applications = inject(ApplicationsStore);
  protected readonly posted = inject(PostedJobsStore);
  protected readonly menuOpen = signal(false);
  protected readonly year = new Date().getFullYear();

  constructor() {
    const router = inject(Router);
    let lastPath = '';
    // scroll to top on page changes, but not when only the filters (query params) change
    const sub = router.events.subscribe((e) => {
      if (!(e instanceof NavigationEnd)) return;
      const path = e.urlAfterRedirects.split('?')[0];
      if (path !== lastPath) window.scrollTo({ top: 0 });
      lastPath = path;
      this.menuOpen.set(false);
    });
    inject(DestroyRef).onDestroy(() => sub.unsubscribe());
  }

  protected toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}

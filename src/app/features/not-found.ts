import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      <app-empty-state icon="search" title="Page not found" text="The page you’re looking for doesn’t exist or was moved.">
        <a routerLink="/jobs" class="btn btn-primary">Go to jobs</a>
      </app-empty-state>
    </div>
  `,
})
export class NotFound {}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JobWithCompany } from '../../core/models/job.model';
import { JobsService } from '../../core/services/jobs.service';
import { SavedJobsStore } from '../../core/stores/saved-jobs.store';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { JobCard } from '../../shared/components/job-card/job-card';
import { ToastService } from '../../shared/components/toast/toast';

@Component({
  selector: 'app-saved-jobs',
  imports: [RouterLink, JobCard, EmptyState, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      <div class="page-header">
        <div>
          <h1>Saved jobs</h1>
          <p>Jobs you bookmarked. They are kept in this browser.</p>
        </div>
        @if (jobs().length) {
          <button type="button" class="btn btn-outline" (click)="askClear()">Clear all</button>
        }
      </div>

      @if (jobs().length) {
        <div class="list">
          @for (job of jobs(); track job.id) {
            <app-job-card [job]="job" />
          }
        </div>
      } @else {
        <app-empty-state
          icon="bookmark"
          title="No saved jobs yet"
          text="Tap the bookmark icon on any job to keep it here for later."
        >
          <a routerLink="/jobs" class="btn btn-primary">Browse jobs</a>
        </app-empty-state>
      }

      @if (confirmClear()) {
        <app-confirm-dialog
          title="Clear all saved jobs?"
          message="All bookmarks will be removed. The jobs themselves stay on the board."
          confirmLabel="Clear all"
          (confirmed)="clear()"
          (cancelled)="cancelClear()"
        />
      }
    </div>
  `,
  styles: `
    .list {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    @media (max-width: 900px) {
      .list {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class SavedJobs {
  private readonly store = inject(SavedJobsStore);
  private readonly jobsService = inject(JobsService);
  private readonly toast = inject(ToastService);

  protected readonly confirmClear = signal(false);
  // keep the order in which jobs were saved; skip jobs that were deleted meanwhile
  protected readonly jobs = computed(() =>
    this.store
      .ids()
      .map((id) => this.jobsService.byId(id))
      .filter((j): j is JobWithCompany => !!j),
  );

  protected askClear(): void {
    this.confirmClear.set(true);
  }

  protected cancelClear(): void {
    this.confirmClear.set(false);
  }

  protected clear(): void {
    this.store.clear();
    this.confirmClear.set(false);
    this.toast.show('Saved jobs cleared');
  }
}

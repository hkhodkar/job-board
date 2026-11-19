import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostedJob, PostedJobsStore } from '../../../core/stores/posted-jobs.store';
import { SavedJobsStore } from '../../../core/stores/saved-jobs.store';
import { CompanyLogo } from '../../../shared/components/company-logo/company-logo';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Icon } from '../../../shared/components/icon/icon';
import { ToastService } from '../../../shared/components/toast/toast';
import { OptionLabelPipe, SalaryPipe } from '../../../shared/pipes/formatting.pipes';

@Component({
  selector: 'app-my-posts',
  imports: [RouterLink, DatePipe, CompanyLogo, ConfirmDialog, EmptyState, Icon, OptionLabelPipe, SalaryPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-posts.html',
  styleUrl: './my-posts.scss',
})
export class MyPosts {
  private readonly store = inject(PostedJobsStore);
  private readonly saved = inject(SavedJobsStore);
  private readonly toast = inject(ToastService);

  protected readonly jobs = this.store.jobs;
  protected readonly toDelete = signal<PostedJob | null>(null);
  protected readonly totalApplicants = computed(() => this.jobs().reduce((sum, j) => sum + (j.applicants ?? 0), 0));

  protected askDelete(job: PostedJob): void {
    this.toDelete.set(job);
  }

  protected cancelDelete(): void {
    this.toDelete.set(null);
  }

  protected confirmDelete(): void {
    const job = this.toDelete();
    if (!job) return;
    this.store.remove(job.id);
    this.saved.remove(job.id);
    this.toDelete.set(null);
    this.toast.show('Job post deleted');
  }
}

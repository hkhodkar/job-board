import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { JobsService } from '../../../core/services/jobs.service';
import { ApplicationsStore } from '../../../core/stores/applications.store';
import { PostedJobsStore } from '../../../core/stores/posted-jobs.store';
import { SavedJobsStore } from '../../../core/stores/saved-jobs.store';
import { CompanyLogo } from '../../../shared/components/company-logo/company-logo';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Icon } from '../../../shared/components/icon/icon';
import { JobCard } from '../../../shared/components/job-card/job-card';
import { ToastService } from '../../../shared/components/toast/toast';
import { OptionLabelPipe, SalaryPipe, TimeAgoPipe } from '../../../shared/pipes/formatting.pipes';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-job-detail',
  imports: [
    RouterLink,
    DatePipe,
    CompanyLogo,
    ConfirmDialog,
    EmptyState,
    Icon,
    JobCard,
    OptionLabelPipe,
    SalaryPipe,
    TimeAgoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-detail.html',
  styleUrl: './job-detail.scss',
})
export class JobDetail {
  private readonly jobs = inject(JobsService);
  private readonly saved = inject(SavedJobsStore);
  private readonly posted = inject(PostedJobsStore);
  private readonly applications = inject(ApplicationsStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly job = computed(() => this.jobs.byId(this.id()));
  protected readonly similar = computed(() => {
    const job = this.job();
    return job ? this.jobs.similarTo(job, 3) : [];
  });
  protected readonly isSaved = computed(() => this.saved.isSaved(this.id()));
  protected readonly application = computed(() => this.applications.forJob(this.id()));
  protected readonly confirmDelete = signal(false);

  constructor() {
    const title = inject(Title);
    effect(() => {
      const job = this.job();
      title.setTitle(job ? `${job.title} at ${job.company.name} · Hireline` : 'Job not found · Hireline');
    });
  }

  protected toggleSave(): void {
    const nowSaved = this.saved.toggle(this.id());
    this.toast.show(nowSaved ? 'Job saved' : 'Removed from saved jobs');
  }

  protected deletePost(): void {
    const job = this.job();
    if (!job) return;
    this.posted.remove(job.id);
    this.saved.remove(job.id);
    this.confirmDelete.set(false);
    this.toast.show('Job post deleted');
    void this.router.navigate(['/employer']);
  }

  protected askDelete(): void {
    this.confirmDelete.set(true);
  }

  protected cancelDelete(): void {
    this.confirmDelete.set(false);
  }
}

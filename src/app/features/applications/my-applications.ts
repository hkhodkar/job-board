import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Application } from '../../core/models/job.model';
import { JobsService } from '../../core/services/jobs.service';
import { ApplicationsStore } from '../../core/stores/applications.store';
import { CompanyLogo } from '../../shared/components/company-logo/company-logo';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Icon } from '../../shared/components/icon/icon';
import { ToastService } from '../../shared/components/toast/toast';
import { FileSizePipe } from '../../shared/pipes/formatting.pipes';

@Component({
  selector: 'app-my-applications',
  imports: [RouterLink, DatePipe, CompanyLogo, ConfirmDialog, EmptyState, Icon, FileSizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-applications.html',
  styleUrl: './my-applications.scss',
})
export class MyApplications {
  private readonly store = inject(ApplicationsStore);
  private readonly jobs = inject(JobsService);
  private readonly toast = inject(ToastService);

  protected readonly toWithdraw = signal<Application | null>(null);
  protected readonly items = computed(() =>
    this.store.items().map((a) => {
      const job = this.jobs.byId(a.jobId);
      return { ...a, job, color: job?.company.color };
    }),
  );

  protected askWithdraw(a: Application): void {
    this.toWithdraw.set(a);
  }

  protected cancelWithdraw(): void {
    this.toWithdraw.set(null);
  }

  protected withdraw(): void {
    const a = this.toWithdraw();
    if (!a) return;
    this.store.withdraw(a.id);
    this.toWithdraw.set(null);
    this.toast.show('Application withdrawn');
  }
}

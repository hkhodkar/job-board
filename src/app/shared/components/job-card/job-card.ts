import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JobWithCompany } from '../../../core/models/job.model';
import { ApplicationsStore } from '../../../core/stores/applications.store';
import { SavedJobsStore } from '../../../core/stores/saved-jobs.store';
import { OptionLabelPipe, SalaryPipe, TimeAgoPipe } from '../../pipes/formatting.pipes';
import { CompanyLogo } from '../company-logo/company-logo';
import { Icon } from '../icon/icon';
import { ToastService } from '../toast/toast';

@Component({
  selector: 'app-job-card',
  imports: [RouterLink, CompanyLogo, Icon, SalaryPipe, TimeAgoPipe, OptionLabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-card.html',
  styleUrl: './job-card.scss',
})
export class JobCard {
  private readonly saved = inject(SavedJobsStore);
  private readonly applications = inject(ApplicationsStore);
  private readonly toast = inject(ToastService);

  readonly job = input.required<JobWithCompany>();
  readonly compact = input(false);

  protected readonly isSaved = computed(() => this.saved.isSaved(this.job().id));
  protected readonly applied = computed(() => !!this.applications.forJob(this.job().id));
  protected readonly visibleTags = computed(() => this.job().tags.slice(0, this.compact() ? 3 : 4));

  protected toggleSave(): void {
    const nowSaved = this.saved.toggle(this.job().id);
    this.toast.show(nowSaved ? 'Job saved' : 'Removed from saved jobs');
  }
}

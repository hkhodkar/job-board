import { Injectable, computed, inject } from '@angular/core';
import { COMPANIES } from '../data/companies';
import { buildSeedJobs } from '../data/jobs';
import { Company, Job, JobWithCompany } from '../models/job.model';
import { PostedJob, PostedJobsStore } from '../stores/posted-jobs.store';
import { colorFor } from '../utils/color';

@Injectable({ providedIn: 'root' })
export class JobsService {
  private readonly posted = inject(PostedJobsStore);
  private readonly seedJobs = buildSeedJobs();
  private readonly companies = new Map(COMPANIES.map((c) => [c.id, c]));

  /** Posted jobs first, then the seeded ones */
  readonly jobs = computed<JobWithCompany[]>(() => [
    ...this.posted.jobs().map((j) => ({ ...j, company: ownCompany(j) })),
    ...this.seedJobs.map((j) => ({ ...j, company: this.companies.get(j.companyId)! })),
  ]);

  readonly totalCompanies = COMPANIES.length;

  byId(id: string): JobWithCompany | undefined {
    return this.jobs().find((j) => j.id === id);
  }

  company(id: string): Company | undefined {
    return this.companies.get(id);
  }

  /** Same category scores highest, shared tags break ties */
  similarTo(job: Job, limit = 3): JobWithCompany[] {
    const tags = new Set(job.tags.map((t) => t.toLowerCase()));
    return this.jobs()
      .filter((j) => j.id !== job.id)
      .map((j) => ({
        job: j,
        score:
          (j.category === job.category ? 3 : 0) +
          j.tags.filter((t) => tags.has(t.toLowerCase())).length * 2 +
          (j.level === job.level ? 1 : 0),
      }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score || b.job.postedAt.localeCompare(a.job.postedAt))
      .slice(0, limit)
      .map((s) => s.job);
  }
}

function ownCompany(job: PostedJob): Company {
  return {
    id: job.companyId,
    name: job.companyName,
    industry: 'Employer account',
    size: 'Not specified',
    headquarters: job.location,
    about: `${job.companyName} posted this job from the employer dashboard. Edit the post any time from "My job posts".`,
    color: colorFor(job.companyName),
  };
}

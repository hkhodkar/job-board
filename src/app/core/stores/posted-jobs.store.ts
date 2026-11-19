import { Injectable, signal } from '@angular/core';
import { Job } from '../models/job.model';
import { randomId, slugify } from '../utils/id';
import { readJson, writeJson } from '../utils/storage';

export const POSTED_JOBS_KEY = 'job-board.posted';

export interface PostedJobDraft {
  title: string;
  companyName: string;
  location: string;
  workMode: Job['workMode'];
  type: Job['type'];
  level: Job['level'];
  category: Job['category'];
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string[];
  tags: string[];
}

export interface PostedJob extends Job {
  companyName: string;
}

@Injectable({ providedIn: 'root' })
export class PostedJobsStore {
  private readonly _jobs = signal<PostedJob[]>(readJson<PostedJob[]>(POSTED_JOBS_KEY, []));

  readonly jobs = this._jobs.asReadonly();

  get(id: string): PostedJob | undefined {
    return this._jobs().find((j) => j.id === id);
  }

  create(draft: PostedJobDraft, now = new Date()): PostedJob {
    const job: PostedJob = {
      ...toJob(draft),
      id: `${slugify(draft.title) || 'job'}-${randomId()}`,
      postedAt: now.toISOString(),
      applicants: 0,
    };
    this.save([job, ...this._jobs()]);
    return job;
  }

  update(id: string, draft: PostedJobDraft, now = new Date()): PostedJob | undefined {
    const existing = this.get(id);
    if (!existing) return undefined;
    const updated: PostedJob = {
      ...existing,
      ...toJob(draft),
      updatedAt: now.toISOString(),
    };
    this.save(this._jobs().map((j) => (j.id === id ? updated : j)));
    return updated;
  }

  remove(id: string): void {
    this.save(this._jobs().filter((j) => j.id !== id));
  }

  private save(jobs: PostedJob[]): void {
    this._jobs.set(jobs);
    writeJson(POSTED_JOBS_KEY, jobs);
  }
}

export function companyIdFor(name: string): string {
  return `own-${slugify(name) || 'company'}`;
}

function toJob(draft: PostedJobDraft): Omit<PostedJob, 'id' | 'postedAt'> {
  return {
    title: draft.title.trim(),
    companyName: draft.companyName.trim(),
    companyId: companyIdFor(draft.companyName),
    location: draft.location.trim(),
    workMode: draft.workMode,
    type: draft.type,
    level: draft.level,
    category: draft.category,
    salaryMin: draft.salaryMin,
    salaryMax: draft.salaryMax,
    summary: draft.description.trim(),
    responsibilities: [],
    requirements: draft.requirements.map((r) => r.trim()).filter(Boolean),
    niceToHave: [],
    benefits: [],
    tags: [...draft.tags],
    isOwn: true,
  };
}

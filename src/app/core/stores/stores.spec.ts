import { TestBed } from '@angular/core/testing';
import { JobsService } from '../services/jobs.service';
import { POSTED_JOBS_KEY, PostedJobDraft, PostedJobsStore } from './posted-jobs.store';
import { SAVED_JOBS_KEY, SavedJobsStore } from './saved-jobs.store';

const stored = (key: string) => JSON.parse(localStorage.getItem(key) ?? 'null');

const fresh = <T>(token: new (...args: never[]) => T): T => {
  TestBed.resetTestingModule();
  return TestBed.inject(token);
};

describe('SavedJobsStore', () => {
  beforeEach(() => localStorage.clear());

  it('starts empty', () => {
    const store = fresh(SavedJobsStore);
    expect(store.ids()).toEqual([]);
    expect(store.count()).toBe(0);
  });

  it('toggles jobs, newest first, and persists them', () => {
    const store = fresh(SavedJobsStore);
    expect(store.toggle('a')).toBe(true);
    store.toggle('b');
    expect(store.ids()).toEqual(['b', 'a']);
    expect(store.isSaved('a')).toBe(true);
    expect(stored(SAVED_JOBS_KEY)).toEqual(['b', 'a']);

    expect(store.toggle('a')).toBe(false);
    expect(store.isSaved('a')).toBe(false);
    expect(stored(SAVED_JOBS_KEY)).toEqual(['b']);
  });

  it('restores saved jobs after a reload and survives broken storage data', () => {
    fresh(SavedJobsStore).toggle('x');
    expect(fresh(SavedJobsStore).ids()).toEqual(['x']);

    localStorage.setItem(SAVED_JOBS_KEY, '{not json');
    expect(fresh(SavedJobsStore).ids()).toEqual([]);
  });

  it('clears everything', () => {
    const store = fresh(SavedJobsStore);
    store.toggle('a');
    store.toggle('b');
    store.clear();
    expect(store.count()).toBe(0);
    expect(stored(SAVED_JOBS_KEY)).toEqual([]);
  });
});

describe('PostedJobsStore', () => {
  const draft: PostedJobDraft = {
    title: '  Angular Developer ',
    companyName: 'Acme Labs',
    location: 'Remote (EU)',
    workMode: 'remote',
    type: 'full-time',
    level: 'mid',
    category: 'engineering',
    salaryMin: 60000,
    salaryMax: 80000,
    description: 'Build things.',
    requirements: ['TypeScript', '  ', 'Angular '],
    tags: ['Angular'],
  };

  beforeEach(() => localStorage.clear());

  it('creates a job with a readable id, trimmed fields and persists it', () => {
    const store = fresh(PostedJobsStore);
    const job = store.create(draft, new Date('2026-01-01T10:00:00Z'));

    expect(job.id).toMatch(/^angular-developer-[a-z0-9]+$/);
    expect(job.title).toBe('Angular Developer');
    expect(job.requirements).toEqual(['TypeScript', 'Angular']);
    expect(job.isOwn).toBe(true);
    expect(job.companyId).toBe('own-acme-labs');
    expect(job.postedAt).toBe('2026-01-01T10:00:00.000Z');
    expect(stored(POSTED_JOBS_KEY)).toHaveLength(1);
    expect(fresh(PostedJobsStore).get(job.id)?.title).toBe('Angular Developer');
  });

  it('updates a job but keeps its id and posting date', () => {
    const store = fresh(PostedJobsStore);
    const job = store.create(draft);
    const updated = store.update(job.id, { ...draft, title: 'Senior Angular Developer', salaryMax: 95000 });

    expect(updated?.id).toBe(job.id);
    expect(updated?.postedAt).toBe(job.postedAt);
    expect(updated?.updatedAt).toBeDefined();
    expect(store.get(job.id)?.salaryMax).toBe(95000);
    expect(store.update('missing', draft)).toBeUndefined();
  });

  it('removes a job', () => {
    const store = fresh(PostedJobsStore);
    const a = store.create(draft);
    const b = store.create({ ...draft, title: 'Designer' });
    store.remove(a.id);
    expect(store.jobs().map((j) => j.id)).toEqual([b.id]);
    expect(stored(POSTED_JOBS_KEY)).toHaveLength(1);
  });

  it('shows posted jobs first in the job list with a generated company', () => {
    TestBed.resetTestingModule();
    const store = TestBed.inject(PostedJobsStore);
    const jobs = TestBed.inject(JobsService);
    const job = store.create(draft);

    expect(jobs.jobs()).toHaveLength(31);
    expect(jobs.jobs()[0].id).toBe(job.id);
    expect(jobs.jobs()[0].company.name).toBe('Acme Labs');

    store.remove(job.id);
    expect(jobs.jobs()).toHaveLength(30);
  });
});

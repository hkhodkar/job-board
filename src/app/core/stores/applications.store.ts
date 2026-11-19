import { Injectable, computed, signal } from '@angular/core';
import { Application } from '../models/job.model';
import { randomId } from '../utils/id';
import { readJson, writeJson } from '../utils/storage';

export const APPLICATIONS_KEY = 'job-board.applications';

@Injectable({ providedIn: 'root' })
export class ApplicationsStore {
  private readonly _items = signal<Application[]>(readJson<Application[]>(APPLICATIONS_KEY, []));

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);

  forJob(jobId: string): Application | undefined {
    return this._items().find((a) => a.jobId === jobId);
  }

  add(data: Omit<Application, 'id' | 'appliedAt'>): Application {
    const application: Application = { ...data, id: randomId(), appliedAt: new Date().toISOString() };
    this.save([application, ...this._items()]);
    return application;
  }

  withdraw(id: string): void {
    this.save(this._items().filter((a) => a.id !== id));
  }

  private save(items: Application[]): void {
    this._items.set(items);
    writeJson(APPLICATIONS_KEY, items);
  }
}

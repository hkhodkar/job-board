import { Injectable, computed, signal } from '@angular/core';
import { readJson, writeJson } from '../utils/storage';

export const SAVED_JOBS_KEY = 'job-board.saved';

@Injectable({ providedIn: 'root' })
export class SavedJobsStore {
  private readonly _ids = signal<string[]>(readJson<string[]>(SAVED_JOBS_KEY, []));

  readonly ids = this._ids.asReadonly();
  readonly count = computed(() => this._ids().length);
  private readonly idSet = computed(() => new Set(this._ids()));

  isSaved(jobId: string): boolean {
    return this.idSet().has(jobId);
  }

  toggle(jobId: string): boolean {
    const saved = this.isSaved(jobId);
    if (saved) {
      this.remove(jobId);
    } else {
      this.update([jobId, ...this._ids()]);
    }
    return !saved;
  }

  remove(jobId: string): void {
    this.update(this._ids().filter((id) => id !== jobId));
  }

  clear(): void {
    this.update([]);
  }

  private update(ids: string[]): void {
    this._ids.set(ids);
    writeJson(SAVED_JOBS_KEY, ids);
  }
}

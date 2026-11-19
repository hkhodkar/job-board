import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { Icon } from '../icon/icon';

interface ToastMessage {
  id: number;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private nextId = 1;

  show(text: string, duration = 2600): void {
    const id = this.nextId++;
    this.messages.update((list) => [...list.slice(-2), { id, text }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number): void {
    this.messages.update((list) => list.filter((m) => m.id !== id));
  }
}

@Component({
  selector: 'app-toasts',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts" aria-live="polite">
      @for (m of toast.messages(); track m.id) {
        <div class="toast" role="status">
          <app-icon class="ok" name="check-circle" />
          <span>{{ m.text }}</span>
          <button type="button" class="close" aria-label="Dismiss" (click)="toast.dismiss(m.id)">
            <app-icon name="x" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts {
      position: fixed;
      left: 50%;
      bottom: 24px;
      transform: translateX(-50%);
      display: grid;
      gap: 8px;
      z-index: 200;
      width: max-content;
      max-width: calc(100vw - 32px);
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 10px 10px 14px;
      background: #172033;
      color: #fff;
      border-radius: 10px;
      box-shadow: var(--shadow-lg);
      font-size: 14px;
      animation: toast-in 0.18s ease-out;
    }
    .ok {
      color: #5ee0a8;
    }
    .close {
      display: grid;
      place-items: center;
      width: 26px;
      height: 26px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: #c4cbd8;
      cursor: pointer;
    }
    .close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
    }
  `,
})
export class Toasts {
  protected readonly toast = inject(ToastService);
}

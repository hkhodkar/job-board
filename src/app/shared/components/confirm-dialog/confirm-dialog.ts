import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'cancel()' },
  template: `
    <div class="backdrop" (mousedown)="onBackdropDown($event)" (click)="onBackdropClick($event)">
      <div class="dialog" role="alertdialog" aria-modal="true" [attr.aria-labelledby]="'dlg-title'">
        <h2 id="dlg-title">{{ title() }}</h2>
        <p>{{ message() }}</p>
        <div class="actions">
          <button #cancelBtn type="button" class="btn btn-outline" (click)="cancel()">Cancel</button>
          <button type="button" class="btn" [class.btn-danger]="danger()" [class.btn-primary]="!danger()" (click)="confirmed.emit()">
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 150;
      display: grid;
      place-items: center;
      padding: 16px;
      background: rgba(15, 23, 42, 0.45);
      animation: fade 0.15s ease-out;
    }
    .dialog {
      width: 100%;
      max-width: 420px;
      padding: 24px;
      background: var(--c-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
    }
    h2 {
      font-size: 18px;
      margin-bottom: 8px;
    }
    p {
      color: var(--c-text-2);
      font-size: 14.5px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 24px;
    }
    @keyframes fade {
      from {
        opacity: 0;
      }
    }
  `,
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Confirm');
  readonly danger = input(true);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly cancelBtn = viewChild.required<ElementRef<HTMLButtonElement>>('cancelBtn');
  private downOnBackdrop = false;

  constructor() {
    afterNextRender(() => this.cancelBtn().nativeElement.focus());
  }

  cancel(): void {
    this.cancelled.emit();
  }

  // only close when the whole click happened on the backdrop, not a drag out of the dialog
  protected onBackdropDown(event: MouseEvent): void {
    this.downOnBackdrop = event.target === event.currentTarget;
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (this.downOnBackdrop && event.target === event.currentTarget) this.cancel();
    this.downOnBackdrop = false;
  }
}

import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-tag-input',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TagInput), multi: true }],
  template: `
    <div class="box" [class.invalid]="invalid()" [class.disabled]="disabled()" (click)="focusInput(field)">
      @for (tag of tags(); track tag) {
        <span class="chip">
          {{ tag }}
          <button type="button" class="chip-remove" [attr.aria-label]="'Remove ' + tag" (click)="remove(tag)">
            <app-icon name="x" [size]="14" />
          </button>
        </span>
      }
      <input
        #field
        type="text"
        [id]="inputId()"
        [placeholder]="full() ? 'Maximum reached' : placeholder()"
        [disabled]="disabled() || full()"
        maxlength="24"
        autocomplete="off"
        (input)="onInput(field)"
        (keydown)="onKeydown($event, field)"
        (blur)="onBlur(field)"
      />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .box {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      min-height: 42px;
      padding: 5px 8px;
      border: 1px solid var(--c-border-strong);
      border-radius: var(--radius-sm);
      background: var(--c-surface);
      cursor: text;
      transition:
        border-color 0.15s,
        box-shadow 0.15s;
    }
    .box:focus-within {
      border-color: var(--c-primary);
      box-shadow: var(--focus-ring);
    }
    .box.invalid {
      border-color: var(--c-danger);
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      height: 28px;
      padding: 0 4px 0 10px;
      border-radius: 6px;
      background: var(--c-primary-50);
      color: var(--c-primary-600);
      font-size: 13px;
      font-weight: 600;
    }
    .chip-remove {
      display: grid;
      place-items: center;
      width: 22px;
      height: 22px;
      padding: 0;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
    .chip-remove:hover {
      background: var(--c-primary-100);
    }
    input {
      flex: 1;
      min-width: 140px;
      height: 30px;
      padding: 0 4px;
      border: 0;
      outline: none;
      background: transparent;
      font-size: 15px;
    }
    input::placeholder {
      color: #98a1b3;
    }
  `,
})
export class TagInput implements ControlValueAccessor {
  readonly placeholder = input('Type and press Enter');
  readonly max = input(8);
  readonly invalid = input(false);
  readonly inputId = input<string>();

  protected readonly tags = signal<string[]>([]);
  protected readonly disabled = signal(false);
  protected readonly full = computed(() => this.tags().length >= this.max());

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string[] | null): void {
    this.tags.set(value ? [...value] : []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  protected focusInput(el: HTMLInputElement): void {
    if (!el.disabled) el.focus();
  }

  // the DOM value is the source of truth for the text being typed, so fast typing never races change detection
  protected onInput(el: HTMLInputElement): void {
    // a comma (also from paste) commits the tag
    if (el.value.includes(',')) {
      const parts = el.value.split(',');
      el.value = parts.pop() ?? '';
      parts.forEach((part) => this.add(part));
    }
  }

  protected onKeydown(event: KeyboardEvent, el: HTMLInputElement): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.add(el.value);
      el.value = '';
    } else if (event.key === 'Backspace' && !el.value && this.tags().length) {
      event.preventDefault();
      this.remove(this.tags()[this.tags().length - 1]);
    }
  }

  protected onBlur(el: HTMLInputElement): void {
    if (el.value.trim()) {
      this.add(el.value);
      el.value = '';
    }
    this.onTouched();
  }

  protected remove(tag: string): void {
    this.tags.update((list) => list.filter((t) => t !== tag));
    this.onChange(this.tags());
    this.onTouched();
  }

  private add(raw: string): void {
    const tag = raw.trim().replace(/\s+/g, ' ');
    if (!tag || this.full()) return;
    if (this.tags().some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    this.tags.update((list) => [...list, tag]);
    this.onChange(this.tags());
  }
}

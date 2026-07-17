import type { DetailedHTMLProps, HTMLAttributes, Ref } from 'react';

/*
 * JSX typings for the @material/web custom elements used in the app. React
 * doesn't ship types for arbitrary custom elements, so each `<md-*>` tag must
 * be declared on React.JSX.IntrinsicElements or TSX won't compile. Only the
 * props/attributes we actually set are typed; custom events
 * (`navigation-bar-activated`, etc.) are wired via ref + addEventListener,
 * not JSX props, since React doesn't map non-standard events to `on*` handlers.
 */
type MdElement<T = HTMLElement> = DetailedHTMLProps<HTMLAttributes<T>, T> & {
  ref?: Ref<T>;
};

type MdButtonProps = MdElement<HTMLElement> & {
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'trailing-icon'?: boolean;
  href?: string;
  target?: '_blank' | '_parent' | '_self' | '_top' | '';
  onClick?: (event: React.MouseEvent) => void;
};

type MdIconButtonProps = MdElement<HTMLElement> & {
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  toggle?: boolean;
  selected?: boolean;
  'aria-label'?: string;
  onClick?: (event: React.MouseEvent) => void;
};

type MdCardProps = MdElement<HTMLElement>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'md-navigation-bar': MdElement & {
        'active-index'?: number;
        'hide-inactive-labels'?: boolean;
      };
      'md-navigation-tab': MdElement & {
        label?: string;
        active?: boolean;
        'show-badge'?: boolean;
        'badge-value'?: string;
      };
      'md-icon': MdElement & { slot?: string };
      'md-filled-button': MdButtonProps;
      'md-outlined-button': MdButtonProps;
      'md-text-button': MdButtonProps;
      'md-icon-button': MdIconButtonProps;
      'md-filled-icon-button': MdIconButtonProps;
      'md-filled-tonal-icon-button': MdIconButtonProps;
      'md-fab': MdElement & { size?: 'small' | 'medium' | 'large'; label?: string; variant?: string };
      'md-elevation': MdElement;
      'md-divider': MdElement & { inset?: boolean };
      'md-outlined-text-field': Omit<MdElement<HTMLElement>, 'onInput'> & {
        label?: string;
        value?: string;
        type?: string;
        rows?: number;
        required?: boolean;
        disabled?: boolean;
        error?: boolean;
        'error-text'?: string;
        'supporting-text'?: string;
        placeholder?: string;
        step?: string;
        maxLength?: number;
        onInput?: (event: React.FormEvent<HTMLElement & { value: string }>) => void;
      };
      'md-elevated-card': MdCardProps;
      'md-filled-card': MdCardProps;
      'md-outlined-card': MdCardProps;
      'md-outlined-select': Omit<MdElement<HTMLElement>, 'onChange'> & {
        label?: string;
        value?: string;
        required?: boolean;
        onChange?: (event: React.FormEvent<HTMLElement & { value: string }>) => void;
      };
      'md-select-option': MdElement<HTMLElement> & {
        value?: string;
        headline?: string;
        selected?: boolean;
      };
      'md-radio': Omit<MdElement<HTMLElement>, 'onChange'> & {
        checked?: boolean;
        value?: string;
        name?: string;
        disabled?: boolean;
        onChange?: (event: React.FormEvent<HTMLElement & { checked: boolean }>) => void;
      };
      'md-checkbox': Omit<MdElement<HTMLElement>, 'onChange'> & {
        checked?: boolean;
        disabled?: boolean;
        onChange?: (event: React.FormEvent<HTMLElement & { checked: boolean }>) => void;
      };
    }
  }
}

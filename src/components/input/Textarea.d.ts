import { TextareaHTMLAttributes, CSSProperties } from 'react';

/**
 * Textarea Component Type Definitions
 */

export type TextareaTheme = 'default' | 'glass' | 'minimal' | 'outlined' | 'filled' | 'gradient';
export type TextareaColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
export type TextareaSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TextareaRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type FocusEffect = 'none' | 'glow' | 'scale' | 'lift';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    // Basic Props
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    autoFocus?: boolean;
    rows?: number;
    maxLength?: number;

    // Appearance
    theme?: TextareaTheme;
    color?: TextareaColor;
    size?: TextareaSize;
    rounded?: TextareaRounded;
    fullWidth?: boolean;

    // Label & Help Text
    label?: string;
    floatingLabel?: boolean;
    helperText?: string;

    // Animation
    animate?: boolean;
    focusEffect?: FocusEffect;

    // Events
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;

    // Styling
    className?: string;
    textareaClassName?: string;
    labelClassName?: string;
    wrapperClassName?: string;
    style?: CSSProperties;
}

declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
export default Textarea;

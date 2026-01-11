import { CSSProperties } from 'react';

/**
 * DateTimePicker Component Type Definitions
 */

export type DateTimeType = 'date' | 'time' | 'datetime';
export type DateTimeColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
export type DateTimeSize = 'sm' | 'md' | 'lg';
export type DateTimeVariant = 'outlined' | 'filled';

export interface DateTimePickerProps {
    // Value
    value?: Date | string;
    onChange?: (date: Date) => void;

    // Type
    type?: DateTimeType;

    // Configuration
    placeholder?: string;
    disabled?: boolean;
    minDate?: Date | string;
    maxDate?: Date | string;

    // Appearance
    color?: DateTimeColor;
    size?: DateTimeSize;
    variant?: DateTimeVariant;
    fullWidth?: boolean;

    // Label & Help
    label?: string;
    helperText?: string;
    error?: string;

    // Styling
    className?: string;
    style?: CSSProperties;
}

declare const DateTimePicker: React.FC<DateTimePickerProps>;
export default DateTimePicker;

import { ComponentPropsWithRef, ForwardRefExoticComponent, RefAttributes } from 'react';

// Button
export interface ButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'color'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  color?: 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
  isLoading?: boolean;
  startIcon?: string;
  endIcon?: string;
  fullWidth?: boolean;
}
export const Button: ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLButtonElement>>;

// Checkbox
export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
  variant?: 'simple' | 'card';
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string | number;
  indeterminate?: boolean;
  icon?: string;
  className?: string;
}
export const Checkbox: ForwardRefExoticComponent<CheckboxProps & RefAttributes<HTMLInputElement>> & {
  Group: React.FC<CheckboxGroupProps>;
};

// CheckboxGroup
export interface CheckboxGroupProps {
  children?: React.ReactNode;
  value?: (string | number)[];
  defaultValue?: (string | number)[];
  onChange?: (values: (string | number)[]) => void;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
  variant?: 'simple' | 'card';
  disabled?: boolean;
  className?: string;
}
export const CheckboxGroup: React.FC<CheckboxGroupProps>;

// DateTimePicker
export interface DateTimePickerProps {
  value?: Date | string;
  defaultValue?: Date | string;
  onChange?: (date: Date | null) => void;
  mode?: 'date' | 'time' | 'datetime';
  minDate?: Date | string;
  maxDate?: Date | string;
  format?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
  theme?: 'default' | 'glass' | 'minimal' | 'outlined' | 'filled';
  disabled?: boolean;
  required?: boolean;
  name?: string;
}
export const DateTimePicker: ForwardRefExoticComponent<DateTimePickerProps & RefAttributes<HTMLInputElement>>;

// FileUpload
export interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
  theme?: 'default' | 'glass' | 'minimal' | 'outlined';
  disabled?: boolean;
  showPreview?: boolean;
}
export const FileUpload: ForwardRefExoticComponent<FileUploadProps & RefAttributes<HTMLInputElement>>;

// Icon
export interface IconProps {
  icon: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'outline' | 'solid';
}
export const Icon: React.FC<IconProps>;
export const iconNames: string[];
export const iconCategories: Record<string, string[]>;

// Input
export interface InputProps extends Omit<ComponentPropsWithRef<'input'>, 'size' | 'color'> {
  label?: string;
  helperText?: string;
  error?: string | boolean;
  success?: string | boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
  theme?: 'default' | 'glass' | 'minimal' | 'outlined' | 'filled' | 'gradient';
  leftIcon?: string;
  rightIcon?: string;
  prefix?: string;
  suffix?: string;
  floatingLabel?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
  isLoading?: boolean;
  clearable?: boolean;
  copyable?: boolean;
}
export const Input: ForwardRefExoticComponent<InputProps & RefAttributes<HTMLInputElement>>;

// Textarea
export interface TextareaProps extends Omit<ComponentPropsWithRef<'textarea'>, 'size' | 'color'> {
  label?: string;
  helperText?: string;
  error?: string | boolean;
  success?: string | boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
  theme?: 'default' | 'glass' | 'minimal' | 'outlined' | 'filled' | 'gradient';
  floatingLabel?: boolean;
  showCharCount?: boolean;
  autoResize?: boolean;
}
export const Textarea: ForwardRefExoticComponent<TextareaProps & RefAttributes<HTMLTextAreaElement>>;

// Radio
export interface RadioProps {
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
  variant?: 'simple' | 'card';
  disabled?: boolean;
  value?: string | number;
  icon?: string;
  className?: string;
}
export const Radio: ForwardRefExoticComponent<RadioProps & RefAttributes<HTMLInputElement>> & {
  Group: React.FC<RadioGroupProps>;
};

// RadioGroup
export interface RadioGroupProps {
  children?: React.ReactNode;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  name?: string;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
  variant?: 'simple' | 'card';
  disabled?: boolean;
  className?: string;
}
export const RadioGroup: React.FC<RadioGroupProps>;

// Select
export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
  disabled?: boolean;
}
export interface SelectProps {
  options?: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, option: SelectOption) => void;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
  theme?: 'default' | 'glass' | 'minimal' | 'outlined' | 'filled';
  disabled?: boolean;
  required?: boolean;
  name?: string;
  label?: string;
  error?: string | boolean;
}
export const Select: ForwardRefExoticComponent<SelectProps & RefAttributes<HTMLInputElement>>;

// MultiSelect
export interface MultiSelectProps {
  options?: SelectOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[], options: SelectOption[]) => void;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
  theme?: 'default' | 'glass' | 'minimal' | 'outlined' | 'filled';
  disabled?: boolean;
  required?: boolean;
  name?: string;
  label?: string;
  error?: string | boolean;
  maxSelections?: number;
}
export const MultiSelect: ForwardRefExoticComponent<MultiSelectProps & RefAttributes<HTMLInputElement>>;

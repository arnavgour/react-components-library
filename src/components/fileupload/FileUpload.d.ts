import { CSSProperties } from 'react';

/**
 * FileUpload Component Type Definitions
 */

export type FileUploadVariant = 'dropzone' | 'compact';
export type FileUploadColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';

export interface FileUploadProps {
    // Variant
    variant?: FileUploadVariant;

    // File Configuration
    multiple?: boolean;
    accept?: string;
    maxSize?: number;
    maxFiles?: number;

    // Labels
    label?: string;
    description?: string;

    // Appearance
    color?: FileUploadColor;
    fullWidth?: boolean;

    // State
    disabled?: boolean;

    // Events
    onFilesChange?: (files: File[]) => void;

    // Styling
    className?: string;
    style?: CSSProperties;
}

declare const FileUpload: React.FC<FileUploadProps>;
export default FileUpload;

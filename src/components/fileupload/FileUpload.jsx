import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';

const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const colorConfig = {
    violet: {
        active: 'border-violet-500 bg-violet-50 dark:bg-violet-900/10',
        text: 'text-violet-600 dark:text-violet-400',
        icon: 'text-violet-500',
        ring: 'focus:ring-violet-500/20',
        // Button style variants
        primary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20',
        secondary: 'bg-violet-100 hover:bg-violet-200 text-violet-700 dark:bg-violet-500/20 dark:hover:bg-violet-500/30 dark:text-violet-300',
        outline: 'border border-violet-200 hover:border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-500/10 bg-transparent',
        ghost: 'text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-500/10 bg-transparent'
    },
    blue: {
        active: 'border-blue-500 bg-blue-50 dark:bg-blue-900/10',
        text: 'text-blue-600 dark:text-blue-400',
        icon: 'text-blue-500',
        ring: 'focus:ring-blue-500/20',
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
        secondary: 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 dark:text-blue-300',
        outline: 'border border-blue-200 hover:border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10 bg-transparent',
        ghost: 'text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10 bg-transparent'
    },
    emerald: {
        active: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        icon: 'text-emerald-500',
        ring: 'focus:ring-emerald-500/20',
        primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
        secondary: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-300',
        outline: 'border border-emerald-200 hover:border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-500/10 bg-transparent',
        ghost: 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10 bg-transparent'
    },
    rose: {
        active: 'border-rose-500 bg-rose-50 dark:bg-rose-900/10',
        text: 'text-rose-600 dark:text-rose-400',
        icon: 'text-rose-500',
        ring: 'focus:ring-rose-500/20',
        primary: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
        secondary: 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:text-rose-300',
        outline: 'border border-rose-200 hover:border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-500/10 bg-transparent',
        ghost: 'text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10 bg-transparent'
    },
    amber: {
        active: 'border-amber-500 bg-amber-50 dark:bg-amber-900/10',
        text: 'text-amber-600 dark:text-amber-400',
        icon: 'text-amber-500',
        ring: 'focus:ring-amber-500/20',
        primary: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
        secondary: 'bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:text-amber-300',
        outline: 'border border-amber-200 hover:border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-500/10 bg-transparent',
        ghost: 'text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-500/10 bg-transparent'
    },
    black: {
        active: 'border-slate-800 dark:border-slate-200 bg-slate-50 dark:bg-slate-800',
        text: 'text-slate-800 dark:text-slate-200',
        icon: 'text-slate-800 dark:text-white',
        ring: 'focus:ring-slate-500/20',
        primary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200',
        secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200',
        outline: 'border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 bg-transparent',
        ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 bg-transparent'
    }
};

const FileUpload = ({
    variant = 'dropzone', // dropzone, compact
    buttonStyle = 'primary', // primary, secondary, outline, ghost
    multiple = false,
    accept,
    maxSize, // in bytes
    maxFiles,
    label = 'Click or drag file to upload',
    description = 'SVG, PNG, JPG or GIF (max. 5MB)',
    color = 'violet',
    fullWidth = true,
    className = '',
    onFilesChange,
    disabled = false
}) => {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    const colors = colorConfig[color] || colorConfig.violet;

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            if (!disabled) setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, [disabled]);

    const validateFile = (file) => {
        if (maxSize && file.size > maxSize) {
            return { valid: false, error: `File ${file.name} exceeds size limit of ${formatBytes(maxSize)}` };
        }
        // Basic accept validation (simple check)
        if (accept) {
            const acceptedTypes = accept.split(',').map(t => t.trim());
            const fileType = file.type;
            const fileName = file.name;
            const isValid = acceptedTypes.some(type => {
                if (type.endsWith('/*')) {
                    return fileType.startsWith(type.replace('/*', ''));
                }
                if (type.startsWith('.')) {
                    return fileName.toLowerCase().endsWith(type.toLowerCase());
                }
                return fileType === type;
            });
            if (!isValid) return { valid: false, error: `File type not accepted: ${file.name}` };
        }
        return { valid: true };
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        processFiles(droppedFiles);
    }, [disabled]);

    const handleInputChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        processFiles(selectedFiles);
    };

    const processFiles = (newFiles) => {
        setError(null);

        let validFiles = [];
        let errors = [];

        newFiles.forEach(file => {
            const validation = validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                errors.push(validation.error);
            }
        });

        if (errors.length > 0) {
            setError(errors[0]); // Show first error for simplicity
            return; // Stop if there are invalid files? Or just add the valid ones? Let's stop.
        }

        if (maxFiles && (files.length + validFiles.length) > maxFiles) {
            setError(`Maximum number of files (${maxFiles}) exceeded`);
            return;
        }

        let updatedFiles;
        if (multiple) {
            updatedFiles = [...files, ...validFiles];
        } else {
            updatedFiles = [validFiles[0]].filter(Boolean); // Only take the first one
        }

        // De-duplicate based on name+size+lastModified
        const uniqueString = f => `${f.name}-${f.size}-${f.lastModified}`;
        const existingKeys = new Set(files.map(uniqueString));

        if (multiple) {
            // Filter out duplicates from the NEW batch if they exist in current
            const distinctNew = validFiles.filter(f => !existingKeys.has(uniqueString(f)));
            updatedFiles = [...files, ...distinctNew];
        } else {
            // If single mode, just replace
            updatedFiles = validFiles.length ? [validFiles[0]] : files;
        }

        setFiles(updatedFiles);
        onFilesChange?.(updatedFiles);
    };

    const removeFile = (e, index) => {
        e.stopPropagation(); // prevent triggering parent click
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        onFilesChange?.(newFiles);
    };

    const handleBoxClick = () => {
        if (!disabled) inputRef.current?.click();
    };

    // Render Logic Based on Variant

    // --- COMPACT VARIANT ---
    if (variant === 'compact') {
        return (
            <div className={`${fullWidth ? 'w-full' : 'w-auto'} ${className}`}>
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    multiple={multiple}
                    accept={accept}
                    onChange={handleInputChange}
                    disabled={disabled}
                />
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleBoxClick}
                        disabled={disabled}
                        className={`
                            inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm
                            focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-950
                            ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800' : colors[buttonStyle]}
                            ${colors.ring}
                         `}
                    >
                        <Icon icon="cloud-arrow-up" size="sm" />
                        Choose File
                    </button>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        {files.length > 0
                            ? `${files.length} file${files.length !== 1 ? 's' : ''} selected`
                            : 'No file chosen'}
                    </span>
                </div>

                {/* Compact List */}
                {files.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                        {files.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700">
                                <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{file.name}</span>
                                <button onClick={(e) => removeFile(e, idx)} className="text-slate-400 hover:text-red-500">
                                    <Icon icon="xmark" size="sm" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {error && (
                    <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
                )}
            </div>
        );
    }

    // --- DROPZONE VARIANT (Default) ---
    return (
        <div className={`${fullWidth ? 'w-full' : 'w-auto'} ${className}`}>
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                multiple={multiple}
                accept={accept}
                onChange={handleInputChange}
                disabled={disabled}
            />

            {/* Drop Zone Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleBoxClick}
                className={`
                    relative group cursor-pointer
                    flex flex-col items-center justify-center
                    w-full rounded-2xl border-2 border-dashed transition-all duration-200
                    p-8 text-center
                    ${disabled
                        ? 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 cursor-not-allowed'
                        : isDragging
                            ? `${colors.active} scale-[1.01]`
                            : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }
                    ${error ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : ''}
                `}
            >
                {/* Icon Circle */}
                <div className={`
                    w-12 h-12 rounded-full mb-4 flex items-center justify-center transition-colors duration-200
                    ${disabled
                        ? 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600'
                        : isDragging
                            ? 'bg-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800'
                    }
                `}>
                    <Icon
                        icon="cloud-arrow-up"
                       
                        className={`text-xl ${disabled ? '' : (isDragging ? colors.text : 'text-slate-400')}`}
                    />
                </div>

                {/* Text */}
                <h4 className={`text-sm font-semibold mb-1 ${disabled ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {isDragging ? 'Drop files here' : label}
                </h4>
                <p className={`text-xs ${disabled ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {description}
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                    <Icon icon="circle-info" />
                    {error}
                </div>
            )}

            {/* File List */}
            {files.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                    {files.map((file, idx) => (
                        <div
                            key={idx}
                            className="
                                group relative flex items-center p-3 rounded-xl border border-slate-200 dark:border-slate-700
                                bg-white dark:bg-slate-900 transition-all hover:shadow-sm
                            "
                        >
                            {/* File Icon */}
                            <div className={`
                                w-8 h-8 rounded-lg flex items-center justify-center mr-3
                                ${colors.active.replace('border-', '')} 
                            `}>
                                <Icon
                                    icon={file.type.includes('image') ? 'image' : 'file-lines'}
                                   
                                    className={`${colors.text} text-sm`}
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {formatBytes(file.size)}
                                </p>
                            </div>

                            {/* Success Icon */}
                            <div className={`mr-2 ${colors.text}`}>
                                <Icon icon="circle-check" className="text-sm" />
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={(e) => removeFile(e, idx)}
                                className="
                                    p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                                    transition-colors
                                "
                            >
                                <Icon icon="trash" className="text-xs" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

FileUpload.propTypes = {
    variant: PropTypes.oneOf(['dropzone', 'compact']),
    buttonStyle: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost']),
    multiple: PropTypes.bool,
    accept: PropTypes.string,
    maxSize: PropTypes.number,
    maxFiles: PropTypes.number,
    label: PropTypes.string,
    description: PropTypes.string,
    color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'black']),
    fullWidth: PropTypes.bool,
    className: PropTypes.string,
    onFilesChange: PropTypes.func,
    disabled: PropTypes.bool
};

export default FileUpload;

import React, { useState, useRef, useEffect, useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';

/**
 * Select Component - A highly customizable select/dropdown with search support
 * 
 * Features:
 * - Multiple themes (default, glass, minimal, outlined, filled)
 * - Multiple colors (violet, blue, emerald, rose, amber, black)
 * - Search/filter functionality
 * - Custom option rendering (text, icons, descriptions)
 * - "Select..." placeholder option
 * - Clear selection button
 * - Form compatible (name, required, value)
 * - Matches Input component styling
 */
const Select = forwardRef(({
    // Data
    options = [],
    value,
    defaultValue = '',
    onChange,
    onSearch,

    // API
    api,
    apiMethod = 'GET',
    apiHeaders = {},
    apiDataPath = '',

    // Field mapping for object arrays
    valueKey = 'value',
    labelKey = 'label',

    // Configuration
    searchable = false,
    clearable = true,
    disabled = false,
    required = false,
    loading = false,
    name,
    id,

    // Placeholder/Default Option
    placeholder = 'Select...',
    showSelectOption = true,
    selectOptionText = 'Select an option',
    selectOptionValue = '',

    // Appearance
    theme = 'default',
    color = 'violet', // violet, blue, emerald, rose, amber, black
    size = 'md',
    rounded = 'xl',
    fullWidth = false,

    // Label & Help
    label,
    helperText,

    // Icons
    leftIcon,
    leftIconVariant = 'fas',
    dropdownIcon = 'chevron-down',
    clearIcon = 'xmark',

    // Animation
    animate = true,
    focusEffect = 'glow',

    // Customization
    className = '',
    labelClassName = '',
    optionsClassName = '',
    renderOption,
    renderSelectedValue,
    noOptionsText = 'No options found',
    optionHeight = 'auto',
    maxDropdownHeight = '240px',

    // Style
    style,

    ...props
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [apiOptions, setApiOptions] = useState([]);
    const [apiLoading, setApiLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);
    const triggerRef = useRef(null);

    // Use forwarded ref or internal ref
    const selectRef = ref || triggerRef;

    // Derived state
    const actualValue = value !== undefined ? value : internalValue;

    // Determine if loading (prop or API)
    const isLoading = loading || apiLoading;

    // Determine options source (prop or API)
    const optionsSource = api ? apiOptions : options;

    // Normalize options to ensure they fit { label, value } format
    const normalizedOptions = useMemo(() => {
        return optionsSource.map(opt => {
            if (typeof opt === 'string' || typeof opt === 'number') {
                return { label: String(opt), value: opt, _original: opt };
            }
            // Map using valueKey and labelKey
            return {
                label: opt[labelKey] !== undefined ? String(opt[labelKey]) : String(opt.label || ''),
                value: opt[valueKey] !== undefined ? opt[valueKey] : opt.value,
                icon: opt.icon,
                iconVariant: opt.iconVariant,
                description: opt.description,
                _original: opt
            };
        });
    }, [optionsSource, valueKey, labelKey]);

    // Filter options based on search
    const filteredOptions = useMemo(() => {
        if (!searchable || !searchQuery) return normalizedOptions;
        return normalizedOptions.filter(opt =>
            String(opt.label).toLowerCase().includes(searchQuery.toLowerCase()) ||
            (opt.description && String(opt.description).toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [normalizedOptions, searchQuery, searchable]);

    // Get selected option object
    const selectedOption = useMemo(() => {
        return normalizedOptions.find(opt => opt.value === actualValue) || null;
    }, [normalizedOptions, actualValue]);

    // Handle outside click to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchQuery('');
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch data from API
    useEffect(() => {
        if (!api) return;

        const fetchData = async () => {
            setApiLoading(true);
            setApiError(null);
            try {
                const response = await fetch(api, {
                    method: apiMethod,
                    headers: {
                        'Content-Type': 'application/json',
                        ...apiHeaders
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                let data = await response.json();

                // Navigate to nested data path if specified (e.g., 'data.items')
                if (apiDataPath) {
                    const paths = apiDataPath.split('.');
                    for (const path of paths) {
                        data = data?.[path];
                    }
                }

                if (Array.isArray(data)) {
                    setApiOptions(data);
                } else {
                    console.warn('Select API response is not an array:', data);
                    setApiOptions([]);
                }
            } catch (error) {
                console.error('Select API fetch error:', error);
                setApiError(error.message);
                setApiOptions([]);
            } finally {
                setApiLoading(false);
            }
        };

        fetchData();
    }, [api, apiMethod, apiDataPath]);

    // Focus search input when opening
    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
    }, [isOpen, searchable]);

    // Reset highlighted index when options change
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [filteredOptions]);

    // Handlers
    const handleToggle = () => {
        if (!disabled && !isLoading) {
            setIsOpen(!isOpen);
            if (isOpen) {
                setSearchQuery('');
                setHighlightedIndex(-1);
            }
        }
    };

    const handleSelect = (optionValue, e) => {
        if (e) e.stopPropagation();

        if (value === undefined) {
            setInternalValue(optionValue);
        }
        onChange?.(optionValue, normalizedOptions.find(o => o.value === optionValue));
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        const newValue = selectOptionValue;
        if (value === undefined) setInternalValue(newValue);
        onChange?.(newValue, null);
        setSearchQuery('');
    };

    const handleKeyDown = (e) => {
        if (disabled) return;

        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex].value);
                } else if (!isOpen) {
                    setIsOpen(true);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchQuery('');
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else {
                    setHighlightedIndex(prev =>
                        prev < filteredOptions.length - 1 ? prev + 1 : prev
                    );
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            default:
                break;
        }
    };

    // Color Configuration
    const colorConfig = {
        violet: {
            focus: 'border-violet-500 ring-violet-500/20 dark:ring-violet-500/90',
            optionSelected: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
            icon: 'text-violet-500',
            iconSelected: 'text-violet-500'
        },
        blue: {
            focus: 'border-blue-500 ring-blue-500/90',
            optionSelected: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
            icon: 'text-blue-500',
            iconSelected: 'text-blue-500'
        },
        emerald: {
            focus: 'border-emerald-500 ring-emerald-500/90',
            optionSelected: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
            icon: 'text-emerald-500',
            iconSelected: 'text-emerald-500'
        },
        rose: {
            focus: 'border-rose-500 ring-rose-500/70',
            optionSelected: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
            icon: 'text-rose-500',
            iconSelected: 'text-rose-500'
        },
        amber: {
            focus: 'border-amber-500 ring-amber-500/90',
            optionSelected: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
            icon: 'text-amber-500',
            iconSelected: 'text-amber-500'
        },
        black: {
            focus: 'border-slate-800 dark:border-slate-200 ring-slate-500/20 dark:ring-slate-500/90',
            optionSelected: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
            icon: 'text-slate-800 dark:text-slate-200',
            iconSelected: 'text-slate-800 dark:text-slate-200'
        }
    };

    const colors = colorConfig[color] || colorConfig.violet;


    // Size configurations (matching Input component)
    const sizeConfig = {
        xs: { height: 'min-h-7', text: 'text-xs', px: 'px-2', py: 'py-1.5', icon: 'text-xs', label: 'text-xs' },
        sm: { height: 'min-h-8', text: 'text-xs', px: 'px-3', py: 'py-2', icon: 'text-xs', label: 'text-xs' },
        md: { height: 'min-h-11', text: 'text-sm', px: 'px-4', py: 'py-2.5', icon: 'text-sm', label: 'text-sm' },
        lg: { height: 'min-h-12', text: 'text-base', px: 'px-5', py: 'py-3.5', icon: 'text-base', label: 'text-base' },
        xl: { height: 'min-h-14', text: 'text-lg', px: 'px-6', py: 'py-4', icon: 'text-lg', label: 'text-lg' }
    };

    // Rounded configurations (matching Input component)
    const roundedConfig = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-full'
    };

    // Theme configurations (matching Input component)
    const themeConfig = {
        default: {
            wrapper: 'bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 shadow-sm',
            text: 'text-slate-900 dark:text-white',
            placeholder: 'text-slate-400 dark:text-slate-500',
            focus: 'bg-white dark:bg-slate-950 ring-1',
            icon: 'text-slate-400 dark:text-slate-500',
            disabled: 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900',
            dropdown: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50',
            option: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
            optionHighlighted: 'bg-slate-100 dark:bg-slate-800 dark:text-slate-100',
            searchInput: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
        },
        glass: {
            wrapper: 'bg-white/60 dark:bg-slate-800/30 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/30 shadow-sm',
            text: 'text-slate-900 dark:text-white',
            placeholder: 'text-slate-400 dark:text-slate-400/50',
            focus: 'bg-white/80 dark:bg-slate-800/40 ring-1',
            icon: 'text-slate-400 dark:text-slate-400/70',
            disabled: 'opacity-40 cursor-not-allowed',
            dropdown: 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/30 shadow-xl',
            option: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-700/50',
            optionHighlighted: 'bg-slate-100/60 dark:bg-slate-700/50',
            searchInput: 'bg-white/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/30 backdrop-blur-sm'
        },
        minimal: {
            wrapper: 'bg-transparent border-b-2 border-slate-200 dark:border-slate-700 rounded-none shadow-none',
            text: 'text-slate-900 dark:text-white',
            placeholder: 'text-slate-400 dark:text-slate-500',
            focus: '',
            icon: 'text-slate-400 dark:text-slate-500',
            disabled: 'opacity-50 cursor-not-allowed',
            dropdown: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl mt-2',
            option: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60',
            optionHighlighted: 'bg-slate-100 dark:bg-slate-700/60',
            searchInput: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
        },
        outlined: {
            wrapper: 'bg-transparent border-2 border-slate-300 dark:border-slate-600',
            text: 'text-slate-900 dark:text-white',
            placeholder: 'text-slate-400 dark:text-slate-500',
            focus: 'ring-2',
            icon: 'text-slate-400 dark:text-slate-500',
            disabled: 'opacity-50 cursor-not-allowed',
            dropdown: 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 shadow-lg',
            option: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60',
            optionHighlighted: 'bg-slate-100 dark:bg-slate-700/60',
            searchInput: 'bg-transparent border-2 border-slate-300 dark:border-slate-600'
        },
        filled: {
            wrapper: 'bg-slate-100 dark:bg-slate-800 border-2 border-transparent',
            text: 'text-slate-900 dark:text-white',
            placeholder: 'text-slate-500 dark:text-slate-400',
            focus: 'bg-white dark:bg-slate-700 ring-1',
            icon: 'text-slate-500 dark:text-slate-400',
            disabled: 'opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-900',
            dropdown: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl',
            option: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600/60',
            optionHighlighted: 'bg-slate-100 dark:bg-slate-600/60',
            searchInput: 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
        }
    };

    // Focus effect configurations
    const focusEffectConfig = {
        none: '',
        glow: 'transition-shadow duration-300',
        ring: 'transition-all duration-200',
        border: 'transition-colors duration-200'
    };

    const currentSize = sizeConfig[size] || sizeConfig.md;
    const currentTheme = themeConfig[theme] || themeConfig.default;
    const currentRounded = roundedConfig[rounded] || roundedConfig.lg;
    const currentFocusEffect = focusEffectConfig[focusEffect] || '';

    // Check if there's a real selection (not the placeholder)
    const hasSelection = actualValue !== selectOptionValue && actualValue !== '' && selectedOption;

    // Render the display value
    const renderDisplayValue = () => {
        if (renderSelectedValue && selectedOption) {
            return renderSelectedValue(selectedOption);
        }

        if (!hasSelection) {
            return <span className={`${currentTheme.placeholder} text-sm`}>{placeholder}</span>;
        }

        return (
            <div className="flex items-center gap-2 truncate">
                {selectedOption.icon && (
                    <Icon
                        icon={selectedOption.icon}
                        variant={selectedOption.iconVariant || 'fas'}
                        className={currentTheme.icon}
                    />
                )}
                <span className={`truncate ${currentTheme.text} ${currentSize.text}`}>{selectedOption.label}</span>
            </div>
        );
    };

    // Render an option
    const renderOptionContent = (opt, isSelected, isHighlighted) => {
        if (renderOption) {
            return renderOption(opt, isSelected);
        }

        return (
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                    {opt.icon && (
                        <Icon
                            icon={opt.icon}
                            variant={opt.iconVariant || 'fas'}
                            className={isSelected ? colors.iconSelected : 'text-slate-400 dark:text-slate-500'}
                        />
                    )}
                    <div className="flex flex-col">
                        <span className={`${currentSize.text} ${isSelected ? 'font-medium' : ''}`}>
                            {opt.label}
                        </span>
                        {opt.description && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {opt.description}
                            </span>
                        )}
                    </div>
                </div>
                {isSelected && (
                    <Icon icon="check" className={`${colors.iconSelected} text-sm flex-shrink-0`} />
                )}
            </div>
        );
    };

    return (
        <div
            className={`${fullWidth ? 'w-full' : 'inline-block'} relative ${isOpen ? 'z-[100]' : ''}`}
            ref={containerRef}
        >
            {/* Label */}
            {label && (
                <label
                    htmlFor={id || name}
                    className={`block mb-1.5 font-medium text-slate-700 dark:text-slate-300 ${currentSize.label} ${labelClassName}`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Hidden input for form compatibility */}
            <input
                type="hidden"
                name={name}
                value={actualValue}
                required={required}
            />

            {/* Select Trigger */}
            <div
                ref={selectRef}
                tabIndex={disabled ? -1 : 0}
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
                className={`
                    relative flex items-center justify-between cursor-pointer
                    ${currentSize.height} ${currentSize.px} ${currentSize.py}
                    ${theme === 'minimal' ? '' : currentRounded}
                    ${currentTheme.wrapper}
                    ${isOpen ? `${currentTheme.focus} ${colors.focus}` : ''}
                    ${disabled ? currentTheme.disabled : ''}
                    ${animate ? currentFocusEffect : ''}
                    ${className}
                    outline-none
                `}
                style={style}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-disabled={disabled}
                {...props}
            >
                {/* Left Icon */}
                {leftIcon && (
                    <span className={`flex-shrink-0 mr-2 ${currentTheme.icon} ${currentSize.icon}`}>
                        {typeof leftIcon === 'string' ? (
                            <Icon icon={leftIcon} variant={leftIconVariant} />
                        ) : leftIcon}
                    </span>
                )}

                {/* Display Value */}
                <div className="flex-1 min-w-0 overflow-hidden">
                    {renderDisplayValue()}
                </div>

                {/* Right Side Icons */}
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    {/* Loading Spinner */}
                    {isLoading && (
                        <Icon icon="spinner-third" variant="fad" className="animate-spin text-slate-400 text-sm" />
                    )}

                    {/* Clear Button */}
                    {clearable && hasSelection && !disabled && !isLoading && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            tabIndex={-1}
                        >
                            <Icon icon={clearIcon} size="sm" />
                        </button>
                    )}

                    {/* Dropdown Arrow */}
                    <span className={`${currentTheme.icon} inline-flex items-center justify-center transition-transform duration-200 origin-center ${isOpen ? 'rotate-180' : ''}`}>
                        <Icon icon={dropdownIcon} className="text-xs" />
                    </span>
                </div>
            </div>

            {/* Helper Text */}
            {helperText && (
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {helperText}
                </p>
            )}

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div
                    className={`
                        absolute z-50 w-full mt-1.5 overflow-hidden
                        ${theme === 'minimal' ? 'rounded-lg' : currentRounded}
                        ${currentTheme.dropdown}
                    `}
                    style={{ maxWidth: containerRef.current?.offsetWidth }}
                    role="listbox"
                >
                    {/* Search Input */}
                    {searchable && (
                        <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="relative">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        onSearch?.(e.target.value);
                                    }}
                                    placeholder="Search..."
                                    className={`
                                        w-full text-sm rounded-md pl-8 pr-3 py-2 outline-none
                                        ${currentTheme.searchInput}
                                        ${currentTheme.text}
                                        border
                                        ${colors.focus}
                                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                                    `}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                                    <Icon icon="search" />
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Options List */}
                    <div
                        className="overflow-y-auto p-1"
                        style={{ maxHeight: maxDropdownHeight }}
                    >
                        {/* Default "Select" Option */}
                        {showSelectOption && !searchQuery && (
                            <div
                                onClick={(e) => handleSelect(selectOptionValue, e)}
                                className={`
                                    flex items-center px-3 py-2 rounded-md cursor-pointer text-sm transition-colors
                                    ${actualValue === selectOptionValue ? colors.optionSelected : ''}
                                    ${(highlightedIndex === -1 && actualValue !== selectOptionValue) ? currentTheme.optionHighlighted : ''}
                                    ${actualValue !== selectOptionValue ? currentTheme.option : ''}
                                    ${optionsClassName}
                                `}
                                role="option"
                                aria-selected={actualValue === selectOptionValue}
                            >
                                <span className="text-slate-400 dark:text-slate-500">{selectOptionText}</span>
                            </div>
                        )}

                        {/* Filtered Options */}
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, index) => {
                                const isSelected = actualValue === opt.value;
                                const isHighlighted = highlightedIndex === index;

                                return (
                                    <div
                                        key={opt.value}
                                        onClick={(e) => handleSelect(opt.value, e)}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                        className={`
                                            px-3 py-2 rounded-md cursor-pointer transition-colors
                                            ${isSelected ? colors.optionSelected : ''}
                                            ${isHighlighted && !isSelected ? currentTheme.optionHighlighted : ''}
                                            ${!isSelected && !isHighlighted ? currentTheme.option : ''}
                                            ${optionsClassName}
                                        `}
                                        style={optionHeight !== 'auto' ? { height: optionHeight } : {}}
                                        role="option"
                                        aria-selected={isSelected}
                                    >
                                        {renderOptionContent(opt, isSelected, isHighlighted)}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                <Icon icon="inbox" className="text-2xl mb-2 opacity-50" />
                                <p>{noOptionsText}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

Select.displayName = 'Select';

Select.propTypes = {
    // Data
    options: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.any.isRequired,
            icon: PropTypes.string,
            iconVariant: PropTypes.oneOf(['fas', 'far', 'fal', 'fad']),
            description: PropTypes.string,
        })
    ])),
    value: PropTypes.any,
    defaultValue: PropTypes.any,
    onChange: PropTypes.func,
    onSearch: PropTypes.func,
    valueKey: PropTypes.string,
    labelKey: PropTypes.string,

    // API
    api: PropTypes.string,
    apiMethod: PropTypes.oneOf(['GET', 'POST', 'PUT', 'PATCH']),
    apiHeaders: PropTypes.object,
    apiDataPath: PropTypes.string,

    // Configuration
    searchable: PropTypes.bool,
    clearable: PropTypes.bool,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    loading: PropTypes.bool,
    name: PropTypes.string,
    id: PropTypes.string,

    // Placeholder
    placeholder: PropTypes.string,
    showSelectOption: PropTypes.bool,
    selectOptionText: PropTypes.string,
    selectOptionValue: PropTypes.any,

    // Appearance
    theme: PropTypes.oneOf(['default', 'glass', 'minimal', 'outlined', 'filled']),
    color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'black']),
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full']),
    fullWidth: PropTypes.bool,

    // Label & Help
    label: PropTypes.string,
    helperText: PropTypes.string,

    // Icons
    leftIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    leftIconVariant: PropTypes.oneOf(['fas', 'far', 'fal', 'fad']),
    dropdownIcon: PropTypes.string,
    clearIcon: PropTypes.string,

    // Animation
    animate: PropTypes.bool,
    focusEffect: PropTypes.oneOf(['none', 'glow', 'ring', 'border']),

    // Customization
    className: PropTypes.string,
    labelClassName: PropTypes.string,
    optionsClassName: PropTypes.string,
    renderOption: PropTypes.func,
    renderSelectedValue: PropTypes.func,
    noOptionsText: PropTypes.string,
    optionHeight: PropTypes.string,
    maxDropdownHeight: PropTypes.string,
    style: PropTypes.object,
};

export default Select;

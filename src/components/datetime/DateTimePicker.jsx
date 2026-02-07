import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';

// --- Date Helpers ---
const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getDayOfWeek = (year, month, day) => new Date(year, month, day).getDay(); // 0 = Sun

// CSS for hiding scrollbars
const scrollbarHideStyles = `
    .time-wheel-scroll::-webkit-scrollbar {
        display: none;
    }
`;

const formatDate = (date, type) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const pad = (n) => n.toString().padStart(2, '0');

    // Simple custom formatters
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear();
    const hours = d.getHours();
    const minutes = d.getMinutes();

    // Time formatting
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const timeStr = `${h12}:${pad(minutes)} ${ampm}`;

    if (type === 'time') return timeStr;
    if (type === 'date') return `${monthNames[month]} ${day}, ${year}`;
    return `${monthNames[month]} ${day}, ${year} ${timeStr}`;
};

const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
};

const scrollWheelToIndex = (ref, index, itemHeight = 40, behavior = 'smooth') => {
    if (ref?.current) {
        const scrollTop = index * itemHeight;
        ref.current.scrollTo({ top: scrollTop, behavior });
    }
};

const getCenteredIndex = (scrollTop, itemHeight = 40, containerHeight = 160) => {
    const index = Math.round(scrollTop / itemHeight);
    return Math.max(0, index);
};

const WheelColumn = ({
    items,
    selectedValue,
    onSelect,
    wheelRef,
    formatValue,
    width = 'w-16',
    isProgrammaticScrollRef,
    colors
}) => {
    // Handle click on an item - scroll to it and select it
    const handleItemClick = (item, idx) => {
        // Mark as programmatic scroll to prevent scroll handler from overriding
        isProgrammaticScrollRef.current = true;
        // Scroll this wheel to center on the clicked item
        scrollWheelToIndex(wheelRef, idx, 40, 'smooth');
        // Update the value
        onSelect(item);
        // Reset programmatic flag after animation
        setTimeout(() => {
            isProgrammaticScrollRef.current = false;
        }, 300);
    };

    // Handle scroll event - detect when scrolling stops to select centered item
    const handleScroll = (e) => {
        // Skip if this is a programmatic scroll (initial load or click)
        if (isProgrammaticScrollRef.current) return;

        const scrollTop = e.target.scrollTop;

        // Calculate which item is centered
        const centeredIndex = getCenteredIndex(scrollTop, 40, 160);
        const clampedIndex = Math.min(Math.max(0, centeredIndex), items.length - 1);
        const centeredItem = items[clampedIndex];

        // Only update if different from current selection
        if (centeredItem !== selectedValue) {
            onSelect(centeredItem);
        }
    };

    return (
        <div className="relative">
            {/* Top fade gradient */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white dark:from-slate-900 to-transparent z-10 pointer-events-none rounded-t-xl" />

            {/* Selection highlight band */}
            <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-10 bg-gradient-to-r ${colors.active.includes('violet') ? 'from-violet-100/50 to-violet-50/50 dark:from-violet-900/30 dark:to-violet-800/30' :
                colors.active.includes('blue') ? 'from-blue-100/50 to-blue-50/50 dark:from-blue-900/30 dark:to-blue-800/30' :
                    colors.active.includes('emerald') ? 'from-emerald-100/50 to-emerald-50/50 dark:from-emerald-900/30 dark:to-emerald-800/30' :
                        colors.active.includes('rose') ? 'from-rose-100/50 to-rose-50/50 dark:from-rose-900/30 dark:to-rose-800/30' :
                            colors.active.includes('amber') ? 'from-amber-100/50 to-amber-50/50 dark:from-amber-900/30 dark:to-amber-800/30' :
                                'from-slate-100/50 to-slate-50/50 dark:from-slate-800/30 dark:to-slate-700/30'
                } rounded-lg border border-slate-200/50 dark:border-slate-700/50 z-0 pointer-events-none`} />

            {/* Scrollable container */}
            <div
                ref={wheelRef}
                onScroll={handleScroll}
                className={`time-wheel-scroll ${width} h-[160px] overflow-y-auto relative`}
                style={{
                    scrollSnapType: 'y mandatory',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {/* Spacer for centering first item */}
                <div className="h-[60px]" />

                {items.map((item, idx) => {
                    const isSelected = item === selectedValue;
                    const displayValue = formatValue ? formatValue(item) : item;

                    return (
                        <button
                            key={idx}
                            onClick={() => handleItemClick(item, idx)}
                            className={`
                            w-full h-10 flex items-center justify-center text-center
                            transition-all duration-200 scroll-snap-align-center
                            ${isSelected
                                    ? `text-xl font-bold ${colors.text}`
                                    : 'text-base font-normal text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                }
                        `}
                            style={{ scrollSnapAlign: 'center' }}
                        >
                            {displayValue}
                        </button>
                    );
                })}

                {/* Spacer for centering last item */}
                <div className="h-[60px]" />
            </div>

            {/* Bottom fade gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-slate-900 to-transparent z-10 pointer-events-none rounded-b-xl" />
        </div>
    );
};

/**
 * DateTimePicker Component
 */
const DateTimePicker = ({
    value,
    onChange,
    type = 'date', // date, time, datetime
    label,
    helperText,
    error,
    placeholder = 'Select date...',
    minDate,
    maxDate,
    disabled = false,
    color = 'violet',
    size = 'md',
    variant = 'outlined', // outlined, filled
    className = '',
    fullWidth = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropUp, setDropUp] = useState(false);
    const containerRef = useRef(null);
    const yearScrollRef = useRef(null);
    const hourWheelRef = useRef(null);
    const minuteWheelRef = useRef(null);
    const ampmWheelRef = useRef(null);

    // Internal state for the calendar view (even if value is null)
    const initialViewDate = value ? new Date(value) : new Date();
    const [viewDate, setViewDate] = useState(initialViewDate); // For navigating months
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);

    // 'days', 'months', 'years'
    const [viewMode, setViewMode] = useState('days');

    // Update internal state when props change
    useEffect(() => {
        if (value) {
            const d = new Date(value);
            setSelectedDate(d);
            setViewDate(d);
        } else {
            setSelectedDate(null);
        }
    }, [value]);

    // Close on click outside and reset view
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setTimeout(() => setViewMode('days'), 200); // Reset after animation
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll to year when opening year view
    useEffect(() => {
        if (viewMode === 'years' && yearScrollRef.current) {
            const el = yearScrollRef.current.querySelector('[data-selected-year="true"]');
            if (el) {
                el.scrollIntoView({ block: 'center', behavior: 'auto' });
            }
        }
    }, [viewMode]);

    // Refs for scroll timeout debouncing (one per wheel)
    const hourScrollTimeoutRef = useRef(null);
    const minuteScrollTimeoutRef = useRef(null);
    const ampmScrollTimeoutRef = useRef(null);

    // Track if we're programmatically scrolling (to avoid triggering selection during programmatic scroll)
    // Use separate flags for each wheel
    const isProgrammaticScrollHourRef = useRef(false);
    const isProgrammaticScrollMinuteRef = useRef(false);
    const isProgrammaticScrollAmPmRef = useRef(false);

    // Helper function to scroll a wheel to a specific index
    // Since we have spacers of 60px (1.5 items) at top/bottom, and container is 160px (4 items),
    // calculating centering is simplified:
    // Item 0 center is at 60 + 20 = 80px. View center is at scrollTop + 80px.
    // So scrollTop = 0 means Item 0 is centered.
    // scrollTop = 40 means Item 1 is centered.
    const scrollWheelToIndex = (ref, index, itemHeight = 40, behavior = 'smooth') => {
        if (ref?.current) {
            const scrollTop = index * itemHeight;
            ref.current.scrollTo({ top: scrollTop, behavior });
        }
    };

    // Helper function to get the centered item index from scroll position
    const getCenteredIndex = (scrollTop, itemHeight = 40, containerHeight = 160) => {
        const index = Math.round(scrollTop / itemHeight);
        return Math.max(0, index);
    };

    // Scroll time wheels to selected values only when picker first opens
    useEffect(() => {
        if (isOpen && (type === 'time' || type === 'datetime')) {
            // Mark all wheels as programmatically scrolling
            isProgrammaticScrollHourRef.current = true;
            isProgrammaticScrollMinuteRef.current = true;
            isProgrammaticScrollAmPmRef.current = true;

            const currentHours = selectedDate ? selectedDate.getHours() : 12;
            const currentMinutes = selectedDate ? selectedDate.getMinutes() : 0;
            const current12Hour = currentHours % 12 || 12;
            const currentAmPm = currentHours >= 12 ? 'PM' : 'AM';

            const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            const ampmOptions = ['AM', 'PM'];

            // Use a short timeout to ensure DOM is ready, then scroll instantly (no animation)
            setTimeout(() => {
                scrollWheelToIndex(hourWheelRef, hours.indexOf(current12Hour), 40, 'instant');
                scrollWheelToIndex(minuteWheelRef, currentMinutes, 40, 'instant');
                scrollWheelToIndex(ampmWheelRef, ampmOptions.indexOf(currentAmPm), 40, 'instant');

                // Reset programmatic scroll flags after scrolling completes
                setTimeout(() => {
                    isProgrammaticScrollHourRef.current = false;
                    isProgrammaticScrollMinuteRef.current = false;
                    isProgrammaticScrollAmPmRef.current = false;
                }, 100);
            }, 50);
        }

        // Cleanup scroll timeouts when closing
        if (!isOpen) {
            if (hourScrollTimeoutRef.current) clearTimeout(hourScrollTimeoutRef.current);
            if (minuteScrollTimeoutRef.current) clearTimeout(minuteScrollTimeoutRef.current);
            if (ampmScrollTimeoutRef.current) clearTimeout(ampmScrollTimeoutRef.current);
        }
    }, [isOpen, type]); // Only run on open/close and type change

    // Color configs
    const colors = {
        violet: {
            active: 'bg-violet-500 text-white',
            hover: 'hover:bg-violet-50 dark:hover:bg-violet-900/30 text-slate-700 dark:text-slate-300',
            text: 'text-violet-600 dark:text-violet-400',
            today: 'text-violet-600 font-bold',
            ring: 'focus:ring-violet-500/20',
            border: 'focus:border-violet-500',
            icon: 'text-violet-500'
        },
        blue: {
            active: 'bg-blue-500 text-white',
            hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300',
            text: 'text-blue-600 dark:text-blue-400',
            today: 'text-blue-600 font-bold',
            ring: 'focus:ring-blue-500/20',
            border: 'focus:border-blue-500',
            icon: 'text-blue-500'
        },
        emerald: {
            active: 'bg-emerald-500 text-white',
            hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-700 dark:text-slate-300',
            text: 'text-emerald-600 dark:text-emerald-400',
            today: 'text-emerald-600 font-bold',
            ring: 'focus:ring-emerald-500/20',
            border: 'focus:border-emerald-500',
            icon: 'text-emerald-500'
        },
        rose: {
            active: 'bg-rose-500 text-white',
            hover: 'hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-700 dark:text-slate-300',
            text: 'text-rose-600 dark:text-rose-400',
            today: 'text-rose-600 font-bold',
            ring: 'focus:ring-rose-500/20',
            border: 'focus:border-rose-500',
            icon: 'text-rose-500'
        },
        amber: {
            active: 'bg-amber-500 text-white',
            hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/30 text-slate-700 dark:text-slate-300',
            text: 'text-amber-600 dark:text-amber-400',
            today: 'text-amber-600 font-bold',
            ring: 'focus:ring-amber-500/20',
            border: 'focus:border-amber-500',
            icon: 'text-amber-500'
        },
        black: {
            active: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
            hover: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
            text: 'text-slate-900 dark:text-white',
            today: 'text-slate-900 dark:text-white font-bold',
            ring: 'focus:ring-slate-500/20',
            border: 'focus:border-slate-900 dark:focus:border-slate-100',
            icon: 'text-slate-900 dark:text-white'
        },
    }[color] || colors.violet;

    // Handlers
    const handleDateClick = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

        if (selectedDate && type !== 'date') {
            newDate.setHours(selectedDate.getHours());
            newDate.setMinutes(selectedDate.getMinutes());
        } else if (!selectedDate) {
            const now = new Date();
            newDate.setHours(now.getHours());
            newDate.setMinutes(now.getMinutes());
        }

        setSelectedDate(newDate);
        onChange?.(newDate);

        if (type === 'date') setIsOpen(false);
    };

    const handleMonthSelect = (monthIdx) => {
        const newDate = new Date(viewDate.getFullYear(), monthIdx, 1);
        setViewDate(newDate);
        setViewMode('days');
    };

    const handleYearSelect = (year) => {
        const newDate = new Date(year, viewDate.getMonth(), 1);
        setViewDate(newDate);
        setViewMode('months'); // Go to month selection after year
    };

    const handleTimeChange = (changeType, val) => {
        const d = selectedDate ? new Date(selectedDate) : new Date();
        const safeVal = isNaN(val) ? 0 : val;

        if (changeType === 'hour12') {
            // Convert 12-hour to 24-hour
            const currentHours = d.getHours();
            const isPM = currentHours >= 12;
            let newHour = safeVal;
            if (isPM) {
                newHour = safeVal === 12 ? 12 : safeVal + 12;
            } else {
                newHour = safeVal === 12 ? 0 : safeVal;
            }
            d.setHours(newHour);
        } else if (changeType === 'ampm') {
            const currentHours = d.getHours();
            const current12Hour = currentHours % 12 || 12;
            if (val === 'AM' && currentHours >= 12) {
                d.setHours(current12Hour === 12 ? 0 : current12Hour);
            } else if (val === 'PM' && currentHours < 12) {
                d.setHours(current12Hour === 12 ? 12 : current12Hour + 12);
            }
        } else if (changeType === 'minute') {
            d.setMinutes(safeVal);
        } else if (changeType === 'hour') {
            d.setHours(safeVal);
        }

        setSelectedDate(d);
        onChange?.(d);
    };

    const navigateMonth = (dir) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + dir, 1);
        setViewDate(newDate);
    };

    // Handle toggle with position calculation
    const handleToggle = () => {
        if (disabled) return;
        
        if (!isOpen) {
            // Calculate if we should drop up or down
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                
                // Estimate popover height based on type
                // Date picker: ~400px, Time picker: ~300px, DateTime: ~400px
                const estimatedHeight = type === 'time' ? 300 : 400;
                
                // If not enough space below and more space above, drop up
                setDropUp(spaceBelow < estimatedHeight && spaceAbove > spaceBelow);
            }
        }
        
        setIsOpen(!isOpen);
    };

    // Calendar Grid Generation
    const generateCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDay = getDayOfWeek(year, month, 1);
        const days = daysInMonth(year, month);
        const prevMonthDays = daysInMonth(year, month - 1);

        const grid = [];

        // Previous month filler
        for (let i = 0; i < firstDay; i++) {
            grid.push({ day: prevMonthDays - firstDay + 1 + i, type: 'prev' });
        }

        // Current month
        for (let i = 1; i <= days; i++) {
            grid.push({ day: i, type: 'current' });
        }

        // Next month filler
        const remaining = 42 - grid.length; // 6 rows * 7 cols
        for (let i = 1; i <= remaining; i++) {
            grid.push({ day: i, type: 'next' });
        }

        return grid;
    };

    const calendarGrid = useMemo(() => generateCalendar(), [viewDate]);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Generate years (1900 - 2100)
    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const yrs = [];
        for (let i = 1900; i <= currentYear + 100; i++) {
            yrs.push(i);
        }
        return yrs;
    }, []);

    // Styles based on variant/size
    const inputClasses = `
        w-full flex items-center justify-between transition-all duration-200 cursor-pointer
        ${size === 'sm' ? 'h-8 px-3 text-xs' : ''}
        ${size === 'md' ? 'h-11 px-4 text-sm' : ''}
        ${size === 'lg' ? 'h-12 px-5 text-base' : ''}
        ${variant === 'outlined'
            ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            : 'bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
        }
        ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : `${isOpen ? colors.border : ''} focus:ring-4 ${colors.ring}`}
        ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900' : 'hover:shadow-sm'}
        rounded-xl outline-none
    `;

    return (
        <>
            <style>{scrollbarHideStyles}</style>
            <div
                className={`relative ${fullWidth ? 'w-full' : 'w-72'} ${className}`}
                ref={containerRef}
            >
                {/* Label */}
                {label && (
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                        {label}
                    </label>
                )}

                {/* Trigger Input */}
                <div
                    className={inputClasses}
                    onClick={handleToggle}
                    role="button"
                    tabIndex={0}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Icon
                            icon={type === 'time' ? 'clock' : 'calendar-days'}
                            variant="far"
                            className={`${selectedDate ? colors.icon : 'text-slate-400'} flex-shrink-0`}
                        />
                        <span className={`block truncate ${selectedDate ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                            {selectedDate ? formatDate(selectedDate, type) : placeholder}
                        </span>
                    </div>
                    {!disabled && (
                        <Icon
                            icon="chevron-down"

                            className={`text-slate-400 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                    )}
                </div>

                {/* Error & Helper Text */}
                {(error || helperText) && (
                    <div className="mt-1.5 ml-1 text-xs">
                        {error ? (
                            <span className="text-red-500 flex items-center gap-1">
                                <Icon icon="circle-exclamation" />
                                {error}
                            </span>
                        ) : (
                            <span className="text-slate-500 dark:text-slate-400">{helperText}</span>
                        )}
                    </div>
                )}

                {/* Popover */}
                {isOpen && (
                    <div
                        className={`
                            absolute left-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden min-w-[320px] w-fit animate-in fade-in duration-150
                            ${dropUp 
                                ? 'bottom-full mb-2 slide-in-from-bottom-2' 
                                : 'top-full mt-2 slide-in-from-top-2'
                            }
                        `}
                    >


                        <div className="flex flex-col sm:flex-row">
                            {/* Views Container */}
                            {type !== 'time' && (
                                <div className="text-sm flex-1 min-w-[320px]">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                                        {viewMode === 'days' && (
                                            <>
                                                <button
                                                    onClick={() => navigateMonth(-1)}
                                                    className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                                                >
                                                    <Icon icon="chevron-left" className="text-xs" />
                                                </button>
                                                <button
                                                    onClick={() => setViewMode('years')}
                                                    className={`font-semibold text-sm ${colors.text} hover:opacity-80 transition-opacity`}
                                                >
                                                    {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                                                </button>
                                                <button
                                                    onClick={() => navigateMonth(1)}
                                                    className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                                                >
                                                    <Icon icon="chevron-right" className="text-xs" />
                                                </button>
                                            </>
                                        )}
                                        {(viewMode === 'months' || viewMode === 'years') && (
                                            <div className="flex items-center justify-center w-full relative">
                                                <button
                                                    onClick={() => setViewMode(viewMode === 'years' ? 'days' : 'years')}
                                                    className="absolute left-0 p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700 text-slate-500"
                                                >
                                                    <Icon icon="arrow-left" className="text-xs" />
                                                </button>
                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    {viewMode === 'years' ? 'Select Year' : 'Select Month'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        {/* Days View */}
                                        {viewMode === 'days' && (
                                            <>
                                                <div className="grid grid-cols-7 mb-2">
                                                    {weekDays.map(d => (
                                                        <div key={d} className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wide py-1">
                                                            {d}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-7 gap-1">
                                                    {calendarGrid.map((cell, idx) => {
                                                        if (cell.type !== 'current') {
                                                            return <div key={idx} className="h-9" />;
                                                        }

                                                        const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), cell.day);
                                                        const isSelected = selectedDate && isSameDay(selectedDate, cellDate);
                                                        const isToday = isSameDay(new Date(), cellDate);

                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={() => handleDateClick(cell.day)}
                                                                className={`
                                                                h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 font-medium
                                                                ${isSelected ? colors.active : colors.hover}
                                                                ${!isSelected && isToday ? colors.today : ''}
                                                                ${!isSelected && !isToday ? 'text-slate-600 dark:text-slate-300' : ''}
                                                            `}
                                                            >
                                                                {cell.day}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        )}

                                        {/* Months View */}
                                        {viewMode === 'months' && (
                                            <div className="grid grid-cols-3 gap-2">
                                                {months.map((m, idx) => (
                                                    <button
                                                        key={m}
                                                        onClick={() => handleMonthSelect(idx)}
                                                        className={`
                                                        p-2 rounded-lg text-sm transition-all
                                                        ${viewDate.getMonth() === idx ? colors.active : colors.hover}
                                                    `}
                                                    >
                                                        {m.substring(0, 3)}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Years View */}
                                        {viewMode === 'years' && (
                                            <div className="h-64 overflow-y-auto custom-scrollbar pr-2" ref={yearScrollRef}>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {years.map((y) => (
                                                        <button
                                                            key={y}
                                                            data-selected-year={viewDate.getFullYear() === y}
                                                            onClick={() => handleYearSelect(y)}
                                                            className={`
                                                            p-2 rounded-lg text-sm transition-all
                                                            ${viewDate.getFullYear() === y ? colors.active : colors.hover}
                                                        `}
                                                        >
                                                            {y}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Time Picker Column - Scrollable Wheel Design */}
                            {(type === 'time' || type === 'datetime') && (() => {
                                const currentHours = selectedDate ? selectedDate.getHours() : 12;
                                const currentMinutes = selectedDate ? selectedDate.getMinutes() : 0;
                                const current12Hour = currentHours % 12 || 12;
                                const currentAmPm = currentHours >= 12 ? 'PM' : 'AM';

                                // Generate arrays for wheels
                                const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                                const minutes = Array.from({ length: 60 }, (_, i) => i);
                                const ampmOptions = ['AM', 'PM'];

                                return (
                                    <div className={`
                                    flex flex-col items-center justify-center gap-3 p-4
                                    ${type === 'time'
                                            ? 'w-full min-w-[240px]'
                                            : 'border-l border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10'
                                        }
                                `}>
                                        {/* Time Header */}
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Select Time
                                        </div>

                                        {/* Wheel Columns Container */}
                                        <div className="flex items-center justify-center gap-1">
                                            {/* Hours Wheel */}
                                            <WheelColumn
                                                items={hours}
                                                selectedValue={current12Hour}
                                                onSelect={(h) => handleTimeChange('hour12', h)}
                                                wheelRef={hourWheelRef}
                                                formatValue={(h) => h.toString().padStart(2, '0')}
                                                isProgrammaticScrollRef={isProgrammaticScrollHourRef}
                                                colors={colors}
                                            />

                                            {/* Colon Separator */}
                                            <div className="flex flex-col items-center justify-center h-[160px]">
                                                <span className={`text-2xl font-bold ${colors.text}`}>:</span>
                                            </div>

                                            {/* Minutes Wheel */}
                                            <WheelColumn
                                                items={minutes}
                                                selectedValue={currentMinutes}
                                                onSelect={(m) => handleTimeChange('minute', m)}
                                                wheelRef={minuteWheelRef}
                                                formatValue={(m) => m.toString().padStart(2, '0')}
                                                isProgrammaticScrollRef={isProgrammaticScrollMinuteRef}
                                                colors={colors}
                                            />

                                            {/* AM/PM Wheel */}
                                            <WheelColumn
                                                items={ampmOptions}
                                                selectedValue={currentAmPm}
                                                onSelect={(ap) => handleTimeChange('ampm', ap)}
                                                wheelRef={ampmWheelRef}
                                                width="w-14"
                                                isProgrammaticScrollRef={isProgrammaticScrollAmPmRef}
                                                colors={colors}
                                            />
                                        </div>

                                        {/* Current Time Display */}
                                        <div className={`text-lg font-semibold ${colors.text} mt-1`}>
                                            {selectedDate ? formatDate(selectedDate, 'time') : '--:-- --'}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

DateTimePicker.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    onChange: PropTypes.func,
    type: PropTypes.oneOf(['date', 'time', 'datetime']),
    label: PropTypes.string,
    helperText: PropTypes.string,
    error: PropTypes.string,
    placeholder: PropTypes.string,
    minDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    disabled: PropTypes.bool,
    color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'black']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    variant: PropTypes.oneOf(['outlined', 'filled']),
    className: PropTypes.string,
    fullWidth: PropTypes.bool,
};

export default DateTimePicker;

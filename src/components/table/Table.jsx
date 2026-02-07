import React, { useState, useEffect, useMemo, useRef, useCallback, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import Checkbox from '../checkbox/Checkbox';
import Select from '../select/Select';
import Input from '../input/Input';

/**
 * Table Component - A powerful, customizable data table
 * 
 * Features:
 * - Multiple themes (default, glass, minimal, striped, bordered, modern, elegant, corporate)
 * - Multiple colors (violet, blue, emerald, rose, amber, black)
 * - Column sorting (single and multi-column)
 * - Global search filter (integrated in table header)
 * - Per-column filters
 * - Pagination with Select component and customizable page sizes
 * - Export functionality (CSV, JSON, Excel)
 * - Resizable columns
 * - minHeight / maxHeight support
 * - Sticky header option
 * - Row selection with "Select All" across ALL pages
 * - Custom cell rendering
 * - Empty state handling
 * - Loading state
 */
const Table = forwardRef(({
    // Data
    data = [],
    columns = [],

    // Search & Filtering
    filterable = false,
    showSearch = true,
    searchPlaceholder = 'Search all columns...',
    globalFilter = '',
    onGlobalFilterChange,
    columnFilters = {},
    onColumnFiltersChange,

    // Export
    showExport = false,
    exportOptions = ['csv', 'json', 'excel'],
    exportFileName = 'table-data',
    onExport,

    // Sorting
    sortable = true,
    defaultSortColumn = null,
    defaultSortDirection = 'asc',
    onSortChange,

    // Pagination
    paginated = true,
    pageSize = 10,
    pageSizeOptions = [5, 10, 20, 50, 100],
    currentPage = 1,
    onPageChange,
    onPageSizeChange,
    paginationLabel = 'Per page:',

    // Selection
    selectable = false,
    showSelectAll = true,
    selectedRows = [],
    onSelectionChange,
    rowKey = 'id',

    // Resizable
    resizable = true,
    minColumnWidth = 80,

    // Appearance
    theme = 'default',
    color = 'violet',
    size = 'md',
    rounded = 'lg',
    stickyHeader = false,
    striped = false,
    hoverable = true,
    bordered = false,

    // Dimensions
    minHeight,
    maxHeight,
    fullWidth = true,

    // Loading & Empty States
    loading = false,
    loadingRows = 5,
    emptyText = 'No data available',
    emptyIcon = 'box',

    // Customization
    className = '',
    headerClassName = '',
    rowClassName = '',
    cellClassName = '',
    renderEmpty,
    renderLoading,
    onRowClick,

    ...props
}, ref) => {
    // State
    const [internalPage, setInternalPage] = useState(currentPage);
    const [internalPageSize, setInternalPageSize] = useState(pageSize);
    const [sortColumn, setSortColumn] = useState(defaultSortColumn);
    const [sortDirection, setSortDirection] = useState(defaultSortDirection);
    const [internalGlobalFilter, setInternalGlobalFilter] = useState(globalFilter);
    const [internalColumnFilters, setInternalColumnFilters] = useState(columnFilters);
    const [columnWidths, setColumnWidths] = useState({});
    const [resizing, setResizing] = useState(null);
    const [internalSelectedRows, setInternalSelectedRows] = useState(selectedRows);
    const [openFilterColumn, setOpenFilterColumn] = useState(null);
    const tableRef = useRef(null);
    const filterRefs = useRef({});
    const filterDropdownRef = useRef(null);
    const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });

    // Derived state
    const actualPage = onPageChange ? currentPage : internalPage;
    const actualPageSize = onPageSizeChange ? pageSize : internalPageSize;
    const actualGlobalFilter = onGlobalFilterChange ? globalFilter : internalGlobalFilter;
    const actualColumnFilters = onColumnFiltersChange ? columnFilters : internalColumnFilters;
    const actualSelectedRows = onSelectionChange ? selectedRows : internalSelectedRows;

    // Close filter dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openFilterColumn) {
                const buttonWrapper = filterRefs.current[openFilterColumn];
                const dropdown = filterDropdownRef.current;

                if (
                    (buttonWrapper && !buttonWrapper.contains(event.target)) &&
                    (!dropdown || !dropdown.contains(event.target))
                ) {
                    setOpenFilterColumn(null);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openFilterColumn]);

    // Handle column resizing
    useEffect(() => {
        if (!resizing) return;

        const handleMouseMove = (e) => {
            e.preventDefault();
            // Calculate width change based on mouse movement from start position
            const diff = e.clientX - resizing.startX;
            const newWidth = Math.max(minColumnWidth, resizing.startWidth + diff);

            setColumnWidths(prev => ({
                ...prev,
                [resizing.column]: newWidth
            }));
        };

        const handleMouseUp = (e) => {
            e.preventDefault();
            setResizing(null);
        };

        // Use capture phase and passive: false to ensure preventDefault works
        document.addEventListener('mousemove', handleMouseMove, { passive: false });
        document.addEventListener('mouseup', handleMouseUp, { passive: false });
        
        // Prevent text selection during resize
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [resizing, minColumnWidth]);

    // Filter and sort data
    const processedData = useMemo(() => {
        let result = [...data];

        // Apply global filter
        if (actualGlobalFilter) {
            const searchLower = actualGlobalFilter.toLowerCase();
            result = result.filter(row =>
                columns.some(col => {
                    const value = row[col.accessor];
                    if (value == null) return false;
                    return String(value).toLowerCase().includes(searchLower);
                })
            );
        }

        // Apply column filters
        Object.entries(actualColumnFilters).forEach(([columnKey, filterValue]) => {
            if (filterValue) {
                const column = columns.find(col => col.accessor === columnKey);
                if (column?.filterFn) {
                    result = result.filter(row => column.filterFn(row[columnKey], filterValue, row));
                } else {
                    const filterLower = filterValue.toLowerCase();
                    result = result.filter(row => {
                        const value = row[columnKey];
                        if (value == null) return false;
                        return String(value).toLowerCase().includes(filterLower);
                    });
                }
            }
        });

        // Apply sorting
        if (sortColumn) {
            const column = columns.find(col => col.accessor === sortColumn);
            result.sort((a, b) => {
                let aVal = a[sortColumn];
                let bVal = b[sortColumn];

                // Custom sort function
                if (column?.sortFn) {
                    return column.sortFn(aVal, bVal, sortDirection);
                }

                // Handle null/undefined
                if (aVal == null) return sortDirection === 'asc' ? 1 : -1;
                if (bVal == null) return sortDirection === 'asc' ? -1 : 1;

                // Numeric sort
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }

                // String sort
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
                if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, actualGlobalFilter, actualColumnFilters, sortColumn, sortDirection, columns]);

    // Get all row IDs from processed (filtered) data - used for "Select All"
    const allRowIds = useMemo(() => {
        return processedData.map(row => row[rowKey]);
    }, [processedData, rowKey]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / actualPageSize);
    const paginatedData = useMemo(() => {
        if (!paginated) return processedData;
        const start = (actualPage - 1) * actualPageSize;
        return processedData.slice(start, start + actualPageSize);
    }, [processedData, actualPage, actualPageSize, paginated]);

    // Handlers
    const handleSort = useCallback((columnAccessor) => {
        const column = columns.find(col => col.accessor === columnAccessor);
        if (!sortable || column?.sortable === false) return;

        let newDirection = 'asc';
        if (sortColumn === columnAccessor) {
            newDirection = sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc';
        }

        if (newDirection === null) {
            setSortColumn(null);
            setSortDirection('asc');
            onSortChange?.(null, null);
        } else {
            setSortColumn(columnAccessor);
            setSortDirection(newDirection);
            onSortChange?.(columnAccessor, newDirection);
        }
    }, [sortable, sortColumn, sortDirection, columns, onSortChange]);

    const handlePageChange = useCallback((page) => {
        const validPage = Math.max(1, Math.min(page, totalPages || 1));
        if (onPageChange) {
            onPageChange(validPage);
        } else {
            setInternalPage(validPage);
        }
    }, [totalPages, onPageChange]);

    const handlePageSizeChange = useCallback((newSize) => {
        const size = typeof newSize === 'string' ? parseInt(newSize, 10) : newSize;
        if (onPageSizeChange) {
            onPageSizeChange(size);
        } else {
            setInternalPageSize(size);
        }
        // Reset to first page when page size changes
        if (onPageChange) {
            onPageChange(1);
        } else {
            setInternalPage(1);
        }
    }, [onPageSizeChange, onPageChange]);

    const handleGlobalFilterChange = useCallback((value) => {
        if (onGlobalFilterChange) {
            onGlobalFilterChange(value);
        } else {
            setInternalGlobalFilter(value);
        }
        handlePageChange(1);
    }, [onGlobalFilterChange, handlePageChange]);

    const handleColumnFilterChange = useCallback((columnKey, value) => {
        const newFilters = { ...actualColumnFilters, [columnKey]: value };
        if (!value) delete newFilters[columnKey];

        if (onColumnFiltersChange) {
            onColumnFiltersChange(newFilters);
        } else {
            setInternalColumnFilters(newFilters);
        }
        handlePageChange(1);
    }, [actualColumnFilters, onColumnFiltersChange, handlePageChange]);

    const handleSelectRow = useCallback((rowId) => {
        let newSelection;
        if (actualSelectedRows.includes(rowId)) {
            newSelection = actualSelectedRows.filter(id => id !== rowId);
        } else {
            newSelection = [...actualSelectedRows, rowId];
        }

        if (onSelectionChange) {
            onSelectionChange(newSelection);
        } else {
            setInternalSelectedRows(newSelection);
        }
    }, [actualSelectedRows, onSelectionChange]);

    // Select ALL rows across ALL pages (from filtered data)
    const handleSelectAll = useCallback(() => {
        const allSelected = allRowIds.length > 0 && allRowIds.every(id => actualSelectedRows.includes(id));

        let newSelection;
        if (allSelected) {
            // Deselect all rows from filtered data
            newSelection = actualSelectedRows.filter(id => !allRowIds.includes(id));
        } else {
            // Select all rows from filtered data
            newSelection = [...new Set([...actualSelectedRows, ...allRowIds])];
        }

        if (onSelectionChange) {
            onSelectionChange(newSelection);
        } else {
            setInternalSelectedRows(newSelection);
        }
    }, [allRowIds, actualSelectedRows, onSelectionChange]);

    const handleResizeStart = useCallback((e, columnAccessor) => {
        e.preventDefault();
        e.stopPropagation();

        // Get the th element directly (parent of the resize handle)
        const th = e.currentTarget.parentElement;
        if (!th) return;

        // Get the actual current width BEFORE any state updates
        const currentWidth = th.offsetWidth;

        // Capture current widths of all columns to "lock" the table layout
        // This ensures other columns don't shrink when one is resized
        const headerRow = th.closest('tr');
        if (headerRow) {
            const ths = headerRow.querySelectorAll('th');
            const snapshotWidths = {};

            ths.forEach(thElement => {
                const accessor = thElement.getAttribute('data-accessor');
                if (accessor) {
                    // Use the actual DOM width, not state
                    snapshotWidths[accessor] = thElement.offsetWidth;
                }
            });

            // Update state with current widths to lock them
            // Use functional update to ensure we have the latest state
            setColumnWidths(prev => {
                // Merge snapshot with existing, but snapshot takes precedence for accuracy
                return {
                    ...prev,
                    ...snapshotWidths
                };
            });
        }

        // Set resizing state with accurate starting position
        setResizing({
            column: columnAccessor,
            startX: e.clientX,
            startWidth: currentWidth
        });
    }, []);

    // Export handler
    const handleExport = useCallback((format) => {
        const dataToExport = processedData;

        if (onExport) {
            onExport(format, dataToExport);
            return;
        }

        // Default export implementations
        if (format === 'csv') {
            const headers = columns.map(col => col.header).join(',');
            const rows = dataToExport.map(row =>
                columns.map(col => {
                    const value = row[col.accessor];
                    // Escape quotes and wrap in quotes if contains comma
                    const strValue = String(value ?? '');
                    return strValue.includes(',') || strValue.includes('"')
                        ? `"${strValue.replace(/"/g, '""')}"`
                        : strValue;
                }).join(',')
            );
            const csv = [headers, ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${exportFileName}.csv`;
            link.click();
        } else if (format === 'json') {
            const json = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${exportFileName}.json`;
            link.click();
        } else if (format === 'excel') {
            // Create Excel XML format
            const headers = columns.map(col => `<th>${col.header}</th>`).join('');
            const rows = dataToExport.map(row =>
                '<tr>' + columns.map(col => {
                    const value = row[col.accessor];
                    return `<td>${String(value ?? '')}</td>`;
                }).join('') + '</tr>'
            ).join('');

            const html = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
                <head><meta charset="UTF-8"></head>
                <body>
                <table border="1">
                    <thead><tr>${headers}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                </body>
                </html>
            `;
            const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${exportFileName}.xls`;
            link.click();
        }
    }, [processedData, columns, exportFileName, onExport]);

    // Theme configurations - Elegant minimalist themes
    const themeConfig = {
        default: {
            container: 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-sm',
            header: 'bg-slate-50/80 dark:bg-slate-800/60',
            headerCell: 'text-slate-500 dark:text-slate-400 font-semibold text-xs tracking-wider',
            row: 'bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80',
            rowHover: 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40',
            rowStriped: 'even:bg-slate-50/40 dark:even:bg-slate-800/20',
            cell: 'text-slate-700 dark:text-slate-300',
            pagination: 'bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800',
            accent: 'border-t-2 border-t-violet-500'
        },
        glass: {
            container: 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 shadow-xl shadow-slate-200/30 dark:shadow-slate-900/40',
            header: 'bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm',
            headerCell: 'text-slate-600 dark:text-slate-300 font-semibold text-xs tracking-wider',
            row: 'bg-transparent border-b border-slate-200/30 dark:border-slate-700/30',
            rowHover: 'hover:bg-white/60 dark:hover:bg-slate-700/30',
            rowStriped: 'even:bg-white/40 dark:even:bg-slate-800/20',
            cell: 'text-slate-700 dark:text-slate-200',
            pagination: 'bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm border-t border-slate-200/30 dark:border-slate-700/30',
            accent: 'border-t-2 border-t-violet-400/50'
        },
        minimal: {
            container: 'bg-transparent',
            header: 'border-b border-slate-200 dark:border-slate-700',
            headerCell: 'text-slate-500 dark:text-slate-400 font-medium text-xs tracking-wider',
            row: 'border-b border-slate-100 dark:border-slate-800',
            rowHover: 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40',
            rowStriped: 'even:bg-slate-50/30 dark:even:bg-slate-800/20',
            cell: 'text-slate-600 dark:text-slate-400',
            pagination: 'border-t border-slate-200 dark:border-slate-700 bg-transparent',
            accent: ''
        },
        striped: {
            container: 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-sm',
            header: 'bg-slate-100/80 dark:bg-slate-800/80',
            headerCell: 'text-slate-600 dark:text-slate-300 font-semibold text-xs tracking-wider',
            row: 'border-b border-slate-100/50 dark:border-slate-800/50',
            rowHover: 'hover:bg-slate-100/60 dark:hover:bg-slate-700/40',
            rowStriped: 'odd:bg-white dark:odd:bg-slate-900 even:bg-slate-50/80 dark:even:bg-slate-800/40',
            cell: 'text-slate-700 dark:text-slate-300',
            pagination: 'bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700',
            accent: 'border-t-2 border-t-slate-300 dark:border-t-slate-600'
        },
        bordered: {
            container: 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 shadow-sm',
            header: 'bg-slate-50 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600',
            headerCell: 'text-slate-600 dark:text-slate-300 font-semibold text-xs tracking-wider border-r border-slate-200 dark:border-slate-700 last:border-r-0',
            row: 'border-b border-slate-200 dark:border-slate-700',
            rowHover: 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
            rowStriped: 'even:bg-slate-50/50 dark:even:bg-slate-800/30',
            cell: 'text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 last:border-r-0',
            pagination: 'bg-slate-50 dark:bg-slate-800/50 border-t border-slate-300 dark:border-slate-600',
            accent: ''
        },
        modern: {
            container: 'bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/60 dark:shadow-slate-900/60 border border-slate-100 dark:border-slate-800',
            header: 'bg-transparent',
            headerCell: 'text-slate-400 dark:text-slate-500 font-bold tracking-widest text-[11px]',
            row: 'border-b border-slate-100 dark:border-slate-800/60',
            rowHover: 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent dark:hover:from-slate-800/40 dark:hover:to-transparent transition-all duration-200',
            rowStriped: 'even:bg-slate-50/30 dark:even:bg-slate-800/20',
            cell: 'text-slate-600 dark:text-slate-300',
            pagination: 'bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800',
            accent: 'border-b-2 border-b-emerald-400'
        },
        elegant: {
            container: 'bg-white dark:bg-slate-950 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/60 border border-slate-200/60 dark:border-slate-800',
            header: 'bg-slate-900 dark:bg-slate-800',
            headerCell: 'text-slate-200 dark:text-slate-300 font-semibold text-xs tracking-wider',
            row: 'border-b border-slate-100 dark:border-slate-800',
            rowHover: 'hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors duration-150',
            rowStriped: 'even:bg-slate-50/60 dark:even:bg-slate-900/40',
            cell: 'text-slate-700 dark:text-slate-300',
            pagination: 'bg-slate-50 dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800',
            accent: ''
        },
        corporate: {
            container: 'bg-white dark:bg-slate-900 border-l-4 border-l-blue-500 dark:border-l-blue-400 shadow-md border border-l-4 border-slate-200 dark:border-slate-700',
            header: 'bg-blue-50/80 dark:bg-blue-950/30',
            headerCell: 'text-blue-900 dark:text-blue-200 font-semibold text-xs tracking-wider',
            row: 'border-b border-slate-100 dark:border-slate-800',
            rowHover: 'hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors',
            rowStriped: 'even:bg-slate-50/40 dark:even:bg-slate-800/20',
            cell: 'text-slate-700 dark:text-slate-300',
            pagination: 'bg-blue-50/30 dark:bg-blue-950/20 border-t border-slate-200 dark:border-slate-700',
            accent: ''
        }
    };

    // Color configurations
    const colorConfig = {
        violet: {
            primary: 'bg-violet-500 text-white',
            primaryHover: 'hover:bg-violet-600',
            primaryLight: 'bg-violet-100 dark:bg-violet-900/30',
            selected: 'bg-violet-50 dark:bg-violet-900/20 border-l-2 border-l-violet-500',
            checkbox: 'accent-violet-500',
            focus: 'focus:ring-violet-500',
            sortActive: 'text-violet-500',
            filterActive: 'text-violet-500 bg-violet-50 dark:bg-violet-900/30',
            gradient: 'from-violet-500 to-purple-600'
        },
        blue: {
            primary: 'bg-blue-500 text-white',
            primaryHover: 'hover:bg-blue-600',
            primaryLight: 'bg-blue-100 dark:bg-blue-900/30',
            selected: 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500',
            checkbox: 'accent-blue-500',
            focus: 'focus:ring-blue-500',
            sortActive: 'text-blue-500',
            filterActive: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30',
            gradient: 'from-blue-500 to-cyan-600'
        },
        emerald: {
            primary: 'bg-emerald-500 text-white',
            primaryHover: 'hover:bg-emerald-600',
            primaryLight: 'bg-emerald-100 dark:bg-emerald-900/30',
            selected: 'bg-emerald-50 dark:bg-emerald-900/20 border-l-2 border-l-emerald-500',
            checkbox: 'accent-emerald-500',
            focus: 'focus:ring-emerald-500',
            sortActive: 'text-emerald-500',
            filterActive: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30',
            gradient: 'from-emerald-500 to-teal-600'
        },
        rose: {
            primary: 'bg-rose-500 text-white',
            primaryHover: 'hover:bg-rose-600',
            primaryLight: 'bg-rose-100 dark:bg-rose-900/30',
            selected: 'bg-rose-50 dark:bg-rose-900/20 border-l-2 border-l-rose-500',
            checkbox: 'accent-rose-500',
            focus: 'focus:ring-rose-500',
            sortActive: 'text-rose-500',
            filterActive: 'text-rose-500 bg-rose-50 dark:bg-rose-900/30',
            gradient: 'from-rose-500 to-pink-600'
        },
        amber: {
            primary: 'bg-amber-500 text-white',
            primaryHover: 'hover:bg-amber-600',
            primaryLight: 'bg-amber-100 dark:bg-amber-900/30',
            selected: 'bg-amber-50 dark:bg-amber-900/20 border-l-2 border-l-amber-500',
            checkbox: 'accent-amber-500',
            focus: 'focus:ring-amber-500',
            sortActive: 'text-amber-500',
            filterActive: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30',
            gradient: 'from-amber-500 to-orange-600'
        },
        black: {
            primary: 'bg-slate-800 dark:bg-white text-white dark:text-slate-900',
            primaryHover: 'hover:bg-slate-900 dark:hover:bg-slate-100',
            primaryLight: 'bg-slate-100 dark:bg-slate-800',
            selected: 'bg-slate-100 dark:bg-slate-800 border-l-2 border-l-slate-800 dark:border-l-white',
            checkbox: 'accent-slate-800 dark:accent-white',
            focus: 'focus:ring-slate-500',
            sortActive: 'text-slate-800 dark:text-white',
            filterActive: 'text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800',
            gradient: 'from-slate-700 to-slate-900'
        }
    };

    // Size configurations
    const sizeConfig = {
        sm: { cell: 'px-3 py-2 text-xs', header: 'px-3 py-3 text-xs' },
        md: { cell: 'px-4 py-3.5 text-sm', header: 'px-4 py-4 text-sm' },
        lg: { cell: 'px-6 py-4 text-base', header: 'px-6 py-5 text-base' }
    };

    // Rounded configurations
    const roundedConfig = {
        none: { container: 'rounded-none', footer: 'rounded-b-none' },
        sm: { container: 'rounded-sm', footer: 'rounded-b-sm' },
        md: { container: 'rounded-md', footer: 'rounded-b-md' },
        lg: { container: 'rounded-lg', footer: 'rounded-b-lg' },
        xl: { container: 'rounded-xl', footer: 'rounded-b-xl' },
        '2xl': { container: 'rounded-2xl', footer: 'rounded-b-2xl' },
        '3xl': { container: 'rounded-3xl', footer: 'rounded-b-3xl' }
    };

    const currentTheme = themeConfig[theme] || themeConfig.default;
    const currentColor = colorConfig[color] || colorConfig.violet;
    const currentSize = sizeConfig[size] || sizeConfig.md;
    const currentRounded = roundedConfig[rounded] || roundedConfig.lg;

    // Check if all rows from filtered data are selected
    const allSelected = allRowIds.length > 0 && allRowIds.every(id => actualSelectedRows.includes(id));
    const someSelected = allRowIds.some(id => actualSelectedRows.includes(id)) && !allSelected;

    // Render sort icon
    const renderSortIcon = (columnAccessor) => {
        if (sortColumn !== columnAccessor) {
            return <Icon icon="arrows-up-down" size="xs" className="opacity-30 group-hover:opacity-60 transition-opacity" />;
        }
        return sortDirection === 'asc'
            ? <Icon icon="arrow-up" size="xs" className={currentColor.sortActive} />
            : <Icon icon="arrow-down" size="xs" className={currentColor.sortActive} />;
    };

    // Render filter button
    const renderFilterButton = (column) => {
        const hasFilter = actualColumnFilters[column.accessor];
        return (
            <div
                className="relative"
                ref={el => filterRefs.current[column.accessor] = el}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (openFilterColumn === column.accessor) {
                            setOpenFilterColumn(null);
                        } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const isRightSide = rect.left > window.innerWidth / 2;
                            setFilterPosition({
                                top: rect.bottom + 8,
                                left: isRightSide ? 'auto' : rect.left,
                                right: isRightSide ? window.innerWidth - rect.right : 'auto'
                            });
                            setOpenFilterColumn(column.accessor);
                        }
                    }}
                    className={`
                        p-1.5 rounded-md transition-all duration-200
                        ${hasFilter
                            ? `${currentColor.filterActive} shadow-sm`
                            : 'hover:bg-slate-200/80 dark:hover:bg-slate-700/80 opacity-60 hover:opacity-100'}
                    `}
                >
                    <Icon icon="filter" size="xs" />
                </button>
                {openFilterColumn === column.accessor && createPortal(
                    <div
                        ref={filterDropdownRef}
                        style={{
                            top: filterPosition.top,
                            left: filterPosition.left,
                            right: filterPosition.right
                        }}
                        className="fixed z-[9999] min-w-[220px] p-3 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2"
                    >
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                            Filter by {column.header}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={actualColumnFilters[column.accessor] || ''}
                                onChange={(e) => handleColumnFilterChange(column.accessor, e.target.value)}
                                placeholder={`Search...`}
                                className={`
                                    w-full pl-9 pr-3 py-2.5 text-sm rounded-lg
                                    bg-slate-50 dark:bg-slate-700/50
                                    border border-slate-200 dark:border-slate-600
                                    text-slate-700 dark:text-slate-200
                                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                                    focus:outline-none focus:ring-2 ${currentColor.focus} focus:border-transparent
                                    transition-all duration-200
                                `}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                            <Icon icon="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        {actualColumnFilters[column.accessor] && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleColumnFilterChange(column.accessor, '');
                                }}
                                className="mt-2 w-full py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                            >
                                Clear filter
                            </button>
                        )}
                    </div>,
                    document.body
                )}
            </div>
        );
    };

    // Render loading skeleton
    const renderLoadingSkeleton = () => {
        if (renderLoading) return renderLoading();

        return Array.from({ length: loadingRows }).map((_, idx) => (
            <tr key={idx} className={`${currentTheme.row}`}>
                {selectable && (
                    <td className={`${currentSize.cell} ${currentTheme.cell}`}>
                        <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    </td>
                )}
                {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`${currentSize.cell} ${currentTheme.cell}`}>
                        <div
                            className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded animate-pulse"
                            style={{
                                width: `${Math.random() * 40 + 50}%`,
                                animationDelay: `${idx * 100}ms`
                            }}
                        />
                    </td>
                ))}
            </tr>
        ));
    };

    // Render empty state
    const renderEmptyState = () => {
        if (renderEmpty) return renderEmpty();

        return (
            <tr>
                <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="text-center py-16"
                >
                    <div className="flex flex-col items-center gap-4 text-slate-400 dark:text-slate-500">
                        <div className={`w-16 h-16 rounded-full ${currentColor.primaryLight} flex items-center justify-center`}>
                            <Icon icon={emptyIcon} size="xl" className="opacity-60" />
                        </div>
                        <div>
                            <p className="text-base font-medium text-slate-600 dark:text-slate-400">{emptyText}</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filters</p>
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    // Render filler rows to maintain table height
    const renderFillerRows = () => {
        if (!paginated || loading || paginatedData.length === 0 || paginatedData.length >= actualPageSize) return null;

        const emptyRows = actualPageSize - paginatedData.length;

        return Array.from({ length: emptyRows }).map((_, idx) => (
            <tr key={`filler-${idx}`} className="border-b border-transparent bg-transparent hover:bg-transparent">
                {selectable && (
                    <td className={`${currentSize.cell} border-b border-transparent`}>
                        &nbsp;
                    </td>
                )}
                {columns.map((col, colIdx) => (
                    <td
                        key={`filler-col-${colIdx}`}
                        className={`${currentSize.cell} border-b border-transparent`}
                    >
                        &nbsp;
                    </td>
                ))}
            </tr>
        ));
    };



    // Render pagination with Select component - New layout
    const renderPagination = () => {
        if (!paginated) return null;

        const startItem = processedData.length > 0 ? (actualPage - 1) * actualPageSize + 1 : 0;
        const endItem = Math.min(actualPage * actualPageSize, processedData.length);

        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, actualPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages || 1, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        // Page size options for Select component
        const pageSizeSelectOptions = pageSizeOptions.map(size => ({
            value: size,
            label: String(size)
        }));

        return (
            <div className={`${currentTheme.pagination} ${currentRounded.footer} relative z-10`}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4">
                    {/* Left side - Page Size Selector and Info */}
                    <div className="flex items-center gap-4 order-1">
                        {/* Showing info */}
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            <span className="hidden sm:inline">Showing </span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{startItem}</span>
                            <span className="mx-1">-</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{endItem}</span>
                            <span className="mx-1">of</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{processedData.length}</span>
                        </div>

                        {/* Selection count */}
                        {selectable && actualSelectedRows.length > 0 && (
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${currentColor.primaryLight} ${currentColor.sortActive}`}>
                                <Icon icon="circle-check" size="xs" />
                                <span>{actualSelectedRows.length} selected</span>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700" />

                        {/* Page Size Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">{paginationLabel}</span>
                            <Select
                                options={pageSizeSelectOptions}
                                value={actualPageSize}
                                onChange={(value) => handlePageSizeChange(value)}
                                size="xs"
                                color={color}
                                rounded="lg"
                                clearable={false}
                                showSelectOption={false}
                                className="min-w-[60px]"
                            />
                        </div>
                    </div>

                    {/* Right side - Page Navigation */}
                    <div className="flex items-center gap-0.5 order-2">
                        {/* First Page */}
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={actualPage === 1}
                            className={`
                                w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hidden sm:flex
                                ${actualPage === 1
                                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95'}
                            `}
                            title="First page"
                        >
                            <Icon icon="chevrons-left" size="sm" />
                        </button>

                        {/* Previous */}
                        <button
                            onClick={() => handlePageChange(actualPage - 1)}
                            disabled={actualPage === 1}
                            className={`
                                w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200
                                ${actualPage === 1
                                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95'}
                            `}
                            title="Previous page"
                        >
                            <Icon icon="chevron-left" size="sm" />
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-0.5 mx-1">
                            {startPage > 1 && (
                                <>
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        className="min-w-[32px] h-8 text-sm rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 active:scale-95"
                                    >
                                        1
                                    </button>
                                    {startPage > 2 && (
                                        <span className="px-1 text-slate-400 dark:text-slate-600 text-sm">…</span>
                                    )}
                                </>
                            )}

                            {pageNumbers.map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`
                                        min-w-[32px] h-8 text-sm rounded-lg transition-all duration-200 font-medium active:scale-95
                                        ${pageNum === actualPage
                                            ? `${currentColor.primary} shadow-md shadow-${color}-500/20`
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}
                                    `}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            {endPage < totalPages && (
                                <>
                                    {endPage < totalPages - 1 && (
                                        <span className="px-1 text-slate-400 dark:text-slate-600 text-sm">…</span>
                                    )}
                                    <button
                                        onClick={() => handlePageChange(totalPages)}
                                        className="min-w-[32px] h-8 text-sm rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 active:scale-95"
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Next */}
                        <button
                            onClick={() => handlePageChange(actualPage + 1)}
                            disabled={actualPage >= (totalPages || 1)}
                            className={`
                                w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200
                                ${actualPage >= (totalPages || 1)
                                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95'}
                            `}
                            title="Next page"
                        >
                            <Icon icon="chevron-right" size="sm" />
                        </button>

                        {/* Last Page */}
                        <button
                            onClick={() => handlePageChange(totalPages || 1)}
                            disabled={actualPage >= (totalPages || 1)}
                            className={`
                                w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hidden sm:flex
                                ${actualPage >= (totalPages || 1)
                                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95'}
                            `}
                            title="Last page"
                        >
                            <Icon icon="chevrons-right" size="sm" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            ref={ref || tableRef}
            className={`${fullWidth ? 'w-full' : ''} ${className}`}
            {...props}
        >
            {/* Table Container */}
            <div
                className={`
                    ${currentTheme.container} ${currentRounded.container}
                    ${resizing ? 'select-none' : ''}
                `}
                style={{
                    minHeight: minHeight,
                    maxHeight: maxHeight
                }}
            >
                {/* Table Header with Search & Export */}
                {(filterable && showSearch) || showExport ? (
                    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                        {/* Search Input */}
                        {filterable && showSearch ? (
                            <div className="flex-1 w-full max-w-2xl">
                                <Input
                                    value={actualGlobalFilter}
                                    onChange={(e) => handleGlobalFilterChange(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    leftIcon="search"
                                    clearable
                                    onClear={() => handleGlobalFilterChange('')}
                                    color={color}
                                    size="md"
                                    className="w-full md:w-[400px]"
                                    rounded="xl"
                                    theme={theme === 'glass' ? 'glass' : 'default'}
                                />
                            </div>
                        ) : (
                            <div />
                        )}

                        {/* Export Dropdown */}
                        {showExport && (
                            <Select
                                options={exportOptions.map(format => ({
                                    value: format,
                                    label: format === 'csv' ? 'CSV' : format === 'json' ? 'JSON' : format === 'excel' ? 'Excel' : format.toUpperCase(),
                                    icon: format === 'csv' ? 'file-csv' : format === 'json' ? 'file-code' : format === 'excel' ? 'file-excel' : 'file-export'
                                }))}
                                value=""
                                onChange={(value) => {
                                    if (value) {
                                        handleExport(value);
                                    }
                                }}
                                placeholder="Export"
                                leftIcon="file-export"
                                size="xs"
                                color={color}
                                rounded="lg"
                                clearable={false}
                                showSelectOption={false}
                                className="min-w-[100px]"
                            />
                        )}
                    </div>
                ) : null}

                {/* Table Content */}
                <div className="relative first:rounded-t-inherit">
                    <div
                        className={`overflow-x-auto overflow-y-visible ${stickyHeader ? 'max-h-full' : ''}`}
                        style={{ maxHeight: maxHeight ? `calc(${typeof maxHeight === 'number' ? maxHeight + 'px' : maxHeight} - 60px)` : undefined }}
                    >
                        <table className={`min-w-full border-collapse table-fixed ${(resizing || Object.keys(columnWidths).length > 0) ? 'w-max' : ''}`}>
                            {/* Header */}
                            <thead className={`${currentTheme.header} ${stickyHeader ? 'sticky top-0 z-20' : ''}`}>
                                <tr>
                                    {/* Selection Checkbox */}
                                    {selectable && (
                                        <th className={`${currentSize.header} ${currentTheme.headerCell} w-14`} style={{ width: '3.5rem' }}>
                                            {showSelectAll ? (
                                                <div className="flex items-center justify-center">
                                                    <Checkbox
                                                        checked={allSelected}
                                                        indeterminate={someSelected}
                                                        onChange={handleSelectAll}
                                                        color={color}
                                                        size="sm"
                                                    />
                                                </div>
                                            ) : null}
                                        </th>
                                    )}

                                    {/* Column Headers */}
                                    {columns.map((column, colIdx) => {
                                        const columnWidth = columnWidths[column.accessor] || column.width;
                                        const isSortable = sortable && column.sortable !== false;
                                        const isFilterable = filterable && column.filterable !== false;
                                        
                                        // Ensure width is in pixels if it's a number
                                        const widthValue = typeof columnWidth === 'number' 
                                            ? `${columnWidth}px` 
                                            : columnWidth;

                                        return (
                                            <th
                                                key={column.accessor || colIdx}
                                                data-accessor={column.accessor}
                                                className={`
                                                    ${currentSize.header}
                                                    ${currentTheme.headerCell}
                                                    ${headerClassName}
                                                    ${isSortable ? 'cursor-pointer select-none group' : ''}
                                                    relative
                                                `}
                                                style={{
                                                    width: widthValue,
                                                    minWidth: column.minWidth || minColumnWidth
                                                }}
                                                onClick={() => isSortable && handleSort(column.accessor)}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        {column.icon && <Icon icon={column.icon} size="sm" className="opacity-60" />}
                                                        <span>{column.header}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {isSortable && renderSortIcon(column.accessor)}
                                                        {isFilterable && renderFilterButton(column)}
                                                    </div>
                                                </div>

                                                {/* Resize Handle */}
                                                {resizable && (
                                                    <div
                                                        className={`
                                                            absolute right-0 top-0 bottom-0 w-1 z-50 cursor-col-resize
                                                            bg-transparent hover:bg-slate-400 dark:hover:bg-slate-500
                                                            transition-colors opacity-0 hover:opacity-100
                                                            ${resizing?.column === column.accessor ? 'bg-slate-500 dark:bg-slate-400 opacity-100' : ''}
                                                        `}
                                                        onMouseDown={(e) => handleResizeStart(e, column.accessor)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onDragStart={(e) => e.preventDefault()}
                                                    />
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>

                            {/* Body */}
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    renderLoadingSkeleton()
                                ) : paginatedData.length === 0 ? (
                                    renderEmptyState()
                                ) : (
                                    paginatedData.map((row, rowIdx) => {
                                        const isSelected = actualSelectedRows.includes(row[rowKey]);

                                        return (
                                            <tr
                                                key={row[rowKey] || rowIdx}
                                                className={`
                                                    ${currentTheme.row}
                                                    ${hoverable ? currentTheme.rowHover : ''}
                                                    ${(striped || theme === 'striped') ? currentTheme.rowStriped : ''}
                                                    ${isSelected ? currentColor.selected : ''}
                                                    ${(selectable || onRowClick) ? 'cursor-pointer' : ''}
                                                    ${rowClassName}
                                                    transition-colors duration-150
                                                `}
                                                onClick={(e) => {
                                                    // Check if click was on an interactive element
                                                    const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
                                                    const isInteractive = interactiveElements.includes(e.target.tagName) ||
                                                        e.target.closest('button, a, input, select, textarea, [role="button"]');

                                                    // Don't select row if clicking on interactive elements
                                                    if (isInteractive) {
                                                        return;
                                                    }

                                                    // Toggle selection when selectable is enabled
                                                    if (selectable) {
                                                        handleSelectRow(row[rowKey]);
                                                    }
                                                    // Also call onRowClick if provided
                                                    onRowClick?.(row, rowIdx);
                                                }}
                                            >
                                                {/* Selection Checkbox */}
                                                {selectable && (
                                                    <td
                                                        className={`${currentSize.cell} ${currentTheme.cell}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="flex items-center justify-center">
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onChange={() => handleSelectRow(row[rowKey])}
                                                                color={color}
                                                                size="sm"
                                                            />
                                                        </div>
                                                    </td>
                                                )}

                                                {/* Data Cells */}
                                                {columns.map((column, colIdx) => {
                                                    const cellValue = row[column.accessor];
                                                    const columnWidth = columnWidths[column.accessor] || column.width;
                                                    
                                                    // Ensure width is in pixels if it's a number
                                                    const widthValue = typeof columnWidth === 'number' 
                                                        ? `${columnWidth}px` 
                                                        : columnWidth;

                                                    return (
                                                        <td
                                                            key={column.accessor || colIdx}
                                                            className={`
                                                                ${currentSize.cell}
                                                                ${currentTheme.cell}
                                                                ${cellClassName}
                                                                ${column.align === 'center' ? 'text-center' : ''}
                                                                ${column.align === 'right' ? 'text-right' : ''}
                                                            `}
                                                            style={{
                                                                width: widthValue,
                                                                minWidth: column.minWidth || minColumnWidth
                                                            }}
                                                        >
                                                            {column.render
                                                                ? column.render(cellValue, row, rowIdx)
                                                                : cellValue ?? <span className="text-slate-400">—</span>
                                                            }
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })
                                )}
                                {renderFillerRows()}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* Pagination Footer */}
                {renderPagination()}
            </div>
        </div>
    );
});

Table.displayName = 'Table';

Table.propTypes = {
    // Data
    data: PropTypes.array,
    columns: PropTypes.arrayOf(PropTypes.shape({
        accessor: PropTypes.string.isRequired,
        header: PropTypes.string.isRequired,
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        minWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        render: PropTypes.func,
        sortable: PropTypes.bool,
        filterable: PropTypes.bool,
        filterFn: PropTypes.func,
        sortFn: PropTypes.func,
        icon: PropTypes.string,
        align: PropTypes.oneOf(['left', 'center', 'right'])
    })),

    // Search & Filtering
    filterable: PropTypes.bool,
    showSearch: PropTypes.bool,
    searchPlaceholder: PropTypes.string,
    globalFilter: PropTypes.string,
    onGlobalFilterChange: PropTypes.func,
    columnFilters: PropTypes.object,
    onColumnFiltersChange: PropTypes.func,

    // Export
    showExport: PropTypes.bool,
    exportOptions: PropTypes.arrayOf(PropTypes.oneOf(['csv', 'json', 'excel'])),
    exportFileName: PropTypes.string,
    onExport: PropTypes.func,

    // Sorting
    sortable: PropTypes.bool,
    defaultSortColumn: PropTypes.string,
    defaultSortDirection: PropTypes.oneOf(['asc', 'desc']),
    onSortChange: PropTypes.func,

    // Pagination
    paginated: PropTypes.bool,
    pageSize: PropTypes.number,
    pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
    currentPage: PropTypes.number,
    onPageChange: PropTypes.func,
    onPageSizeChange: PropTypes.func,
    paginationLabel: PropTypes.string,

    // Selection
    selectable: PropTypes.bool,
    showSelectAll: PropTypes.bool,
    selectedRows: PropTypes.array,
    onSelectionChange: PropTypes.func,
    rowKey: PropTypes.string,

    // Resizable
    resizable: PropTypes.bool,
    minColumnWidth: PropTypes.number,

    // Appearance
    theme: PropTypes.oneOf(['default', 'glass', 'minimal', 'striped', 'bordered', 'modern', 'elegant', 'corporate']),
    color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'black']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']),
    stickyHeader: PropTypes.bool,
    striped: PropTypes.bool,
    hoverable: PropTypes.bool,
    bordered: PropTypes.bool,

    // Dimensions
    minHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fullWidth: PropTypes.bool,

    // Loading & Empty
    loading: PropTypes.bool,
    loadingRows: PropTypes.number,
    emptyText: PropTypes.string,
    emptyIcon: PropTypes.string,
    renderEmpty: PropTypes.func,
    renderLoading: PropTypes.func,

    // Customization
    className: PropTypes.string,
    headerClassName: PropTypes.string,
    rowClassName: PropTypes.string,
    cellClassName: PropTypes.string,
    onRowClick: PropTypes.func
};

export default Table;

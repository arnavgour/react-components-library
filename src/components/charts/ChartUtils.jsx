import React, { useState, useCallback } from 'react';

/**
 * Shared utilities for all chart components
 */

// Color palettes - each with shades from dark to light
export const colorPalettes = {
  violet: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'],
  blue: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'],
  emerald: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'],
  rose: ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6', '#fff1f2'],
  amber: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7', '#fffbeb'],
  slate: ['#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'],
};

// Multi-color palette for distinct categories
export const multiColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#06b6d4', '#84cc16'];

/**
 * Get a single color from a palette
 */
export const getColor = (palette, index = 0) => {
  if (palette === 'multi') {
    return multiColors[index % multiColors.length];
  }
  const colors = colorPalettes[palette] || colorPalettes.violet;
  return colors[Math.min(index, colors.length - 1)];
};

/**
 * Get color shades for pie/donut charts (same color, different shades)
 */
export const getShades = (palette, count) => {
  const colors = colorPalettes[palette] || colorPalettes.violet;
  const shades = [];
  for (let i = 0; i < count; i++) {
    const index = Math.floor((i / count) * colors.length);
    shades.push(colors[Math.min(index, colors.length - 1)]);
  }
  return shades;
};

/**
 * Format number with optional compact notation
 */
export const formatNumber = (num, compact = false) => {
  if (compact && Math.abs(num) >= 1000) {
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
    const suffix = suffixes[tier];
    const scale = Math.pow(10, tier * 3);
    return (num / scale).toFixed(1) + suffix;
  }
  return num.toLocaleString();
};

/**
 * Chart Tooltip Component - Enhanced with glass morphism, smooth transitions, and viewport boundary detection
 */
export const ChartTooltip = ({ x, y, visible, content, theme = 'default', chartRef }) => {
  const [position, setPosition] = React.useState({ left: 0, top: 0, placement: 'top' });
  const tooltipRef = React.useRef(null);

  React.useEffect(() => {
    if (!visible || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;

    // Get chart container position if available, otherwise use viewport
    let containerRect = null;
    if (chartRef?.current) {
      containerRect = chartRef.current.getBoundingClientRect();
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 10; // Minimum padding from edges

    // Calculate absolute position of tooltip in viewport
    let absX = x;
    let absY = y;

    if (containerRect) {
      absX = containerRect.left + x;
      absY = containerRect.top + y;
    }

    // Determine horizontal position
    let left = x;
    let horizontalShift = 'center';

    // Check if tooltip would overflow right edge
    if (absX + tooltipWidth / 2 > viewportWidth - padding) {
      horizontalShift = 'right';
      left = x - tooltipWidth / 2 + Math.min(padding, viewportWidth - absX);
    }
    // Check if tooltip would overflow left edge
    else if (absX - tooltipWidth / 2 < padding) {
      horizontalShift = 'left';
      left = x + tooltipWidth / 2 - Math.min(padding, absX);
    }

    // Determine vertical position
    let top = y - tooltipHeight - 10;
    let placement = 'top';

    // If tooltip would overflow top, place it below
    if (absY - tooltipHeight - 10 < padding) {
      top = y + 20;
      placement = 'bottom';
    }

    setPosition({ left, top, placement, horizontalShift });
  }, [x, y, visible, chartRef]);

  if (!visible) return null;

  const themeClasses = {
    default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg',
    glass: 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 shadow-xl',
    dark: 'bg-slate-900 border border-slate-700 shadow-xl',
  };

  // Get arrow position based on horizontal shift
  const getArrowClasses = () => {
    const baseArrow = position.placement === 'top'
      ? 'top-full border-t-white dark:border-t-slate-800 border-b-0'
      : 'bottom-full border-b-white dark:border-b-slate-800 border-t-0 rotate-180';

    if (position.horizontalShift === 'left') {
      return `${baseArrow} left-4`;
    } else if (position.horizontalShift === 'right') {
      return `${baseArrow} right-4`;
    }
    return `${baseArrow} left-1/2 -translate-x-1/2`;
  };

  return (
    <div
      ref={tooltipRef}
      className={`absolute z-50 px-3 py-2 rounded-lg text-sm pointer-events-none transition-all duration-150 ${themeClasses[theme]}`}
      style={{
        left: position.left,
        top: position.top,
        transform: position.horizontalShift === 'center' ? 'translateX(-50%)' : 'none',
      }}
    >
      {content}
      <div
        className={`absolute w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent ${getArrowClasses()}`}
      />
    </div>
  );
};


/**
 * Legend shape icons for different legend styles
 */
const LegendIcon = ({ shape = 'circle', color, size = 12 }) => {
  const s = size;
  switch (shape) {
    case 'square':
      return <div className="rounded-sm" style={{ width: s, height: s, backgroundColor: color }} />;
    case 'line':
      return (
        <svg width={s + 8} height={s} viewBox={`0 0 ${s + 8} ${s}`}>
          <line x1="0" y1={s / 2} x2={s + 8} y2={s / 2} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'dashed':
      return (
        <svg width={s + 8} height={s} viewBox={`0 0 ${s + 8} ${s}`}>
          <line x1="0" y1={s / 2} x2={s + 8} y2={s / 2} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4,3" />
        </svg>
      );
    case 'diamond':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${s / 2},0 ${s},${s / 2} ${s / 2},${s} 0,${s / 2}`} fill={color} />
        </svg>
      );
    case 'circle':
    default:
      return <div className="rounded-full" style={{ width: s, height: s, backgroundColor: color }} />;
  }
};

/**
 * Enhanced Chart Legend Component
 * 
 * Props:
 * - items: Array of { color, label, inactive?, value? }
 * - position: 'top' | 'bottom' | 'left' | 'right' (default: 'bottom')
 * - align: 'start' | 'center' | 'end' (default: 'center')
 * - shape: 'circle' | 'square' | 'line' | 'dashed' | 'diamond' (default: 'circle')
 * - interactive: boolean - click to toggle items
 * - onToggle: (index, active) => void
 * - layout: 'horizontal' | 'vertical' (auto-determined from position if not provided)
 * - className: extra CSS classes
 */
export const ChartLegend = ({
  items = [],
  position = 'bottom',
  align = 'center',
  shape = 'circle',
  interactive = false,
  onToggle,
  layout,
  className = '',
}) => {
  const [hiddenItems, setHiddenItems] = useState(new Set());

  const handleToggle = useCallback((index) => {
    if (!interactive) return;
    setHiddenItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
    if (onToggle) {
      onToggle(index, hiddenItems.has(index));
    }
  }, [interactive, onToggle, hiddenItems]);

  // Auto-determine layout from position
  const isVertical = layout
    ? layout === 'vertical'
    : (position === 'left' || position === 'right');

  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  };

  const verticalAlignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
  };

  const positionClasses = {
    top: 'mb-3',
    bottom: 'mt-3',
    left: 'mr-4',
    right: 'ml-4',
  };

  return (
    <div
      className={`
        flex ${isVertical ? 'flex-col' : 'flex-wrap'} gap-x-5 gap-y-2
        ${isVertical ? verticalAlignClasses[align] : alignClasses[align]}
        ${positionClasses[position] || 'mt-3'}
        ${className}
      `}
    >
      {items.map((item, i) => {
        const isHidden = hiddenItems.has(i) || item.inactive;
        return (
          <div
            key={i}
            className={`
              flex items-center gap-2 text-sm
              ${interactive ? 'cursor-pointer select-none hover:opacity-80 transition-opacity' : ''}
              ${isHidden ? 'opacity-40' : ''}
            `}
            onClick={() => handleToggle(i)}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleToggle(i); } : undefined}
          >
            <LegendIcon shape={shape} color={item.color} />
            <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
              {item.label}
            </span>
            {item.value !== undefined && (
              <span className="text-slate-500 dark:text-slate-500 font-medium text-xs ml-1">
                {item.value}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Crosshair Overlay for snap-to-point hover behavior
 * Renders a vertical line at the snapped X position with highlighted point(s)
 */
export const ChartCrosshair = ({
  x,
  y,
  visible,
  chartHeight,
  chartY = 0,     // Top offset for charts with padding
  points = [],     // Array of { y, color } for multi-series highlight dots
  color = '#94a3b8',
  dashArray = '4,4',
}) => {
  if (!visible || x == null) return null;
  return (
    <g className="chart-crosshair" style={{ pointerEvents: 'none' }}>
      {/* Vertical crosshair line */}
      <line
        x1={x}
        y1={chartY}
        x2={x}
        y2={chartY + chartHeight}
        stroke={color}
        strokeWidth={1}
        strokeDasharray={dashArray}
        opacity={0.5}
      />
      {/* Highlight dots at each series point */}
      {points.map((point, i) => (
        <g key={i}>
          {/* Outer glow */}
          <circle
            cx={x}
            cy={point.y}
            r={8}
            fill={point.color}
            opacity={0.15}
          />
          {/* White border */}
          <circle
            cx={x}
            cy={point.y}
            r={5}
            fill="white"
            stroke={point.color}
            strokeWidth={2.5}
          />
        </g>
      ))}
    </g>
  );
};

/**
 * Hook for crosshair snap behavior
 * Returns event handlers and crosshair state for any chart with data points
 */
export const useCrosshairSnap = ({
  data = [],
  chartX = 0,
  chartWidth = 0,
  chartHeight = 0,
  yKeys = [],
  getPointY,     // (dataItem, key) => y coordinate
  getColor: getColorFn,
  xKey = 'name',
  containerRef,
  showTooltip = true,
  tooltipFormatter,
  formatValue,
  isMultiSeries = false,
}) => {
  const [crosshair, setCrosshair] = useState({ visible: false, x: 0, index: -1, points: [] });
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });

  const handleChartMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || data.length === 0) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Find nearest data point index by X position
    const stepWidth = chartWidth / Math.max(data.length - 1, 1);
    let nearestIndex = Math.round((mouseX - chartX) / stepWidth);
    nearestIndex = Math.max(0, Math.min(nearestIndex, data.length - 1));

    const snapX = chartX + (nearestIndex / Math.max(data.length - 1, 1)) * chartWidth;
    const item = data[nearestIndex];

    // Get Y positions for all series at this index
    const points = yKeys.map((key, ki) => ({
      y: getPointY(item, key, nearestIndex),
      color: getColorFn(ki),
    }));

    setCrosshair({ visible: true, x: snapX, index: nearestIndex, points });

    if (showTooltip) {
      // Build tooltip content showing all series values at this point
      const content = tooltipFormatter
        ? tooltipFormatter(item, nearestIndex)
        : (
          <div className="text-slate-700 dark:text-slate-200">
            <div className="font-medium text-slate-900 dark:text-white mb-1">{item[xKey]}</div>
            {yKeys.map((key, ki) => (
              <div key={key} className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColorFn(ki) }} />
                <span className="capitalize">{key}:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {formatValue ? formatValue(item[key] || 0) : formatNumber(item[key] || 0)}
                </span>
              </div>
            ))}
          </div>
        );

      setTooltip({
        visible: true,
        x: snapX,
        y: Math.min(...points.map(p => p.y)) - 10,
        content,
      });
    }
  }, [data, chartX, chartWidth, chartHeight, yKeys, getPointY, getColorFn, xKey, containerRef, showTooltip, tooltipFormatter, formatValue]);

  const handleChartMouseLeave = useCallback(() => {
    setCrosshair({ visible: false, x: 0, index: -1, points: [] });
    setTooltip({ visible: false, x: 0, y: 0, content: null });
  }, []);

  return { crosshair, tooltip, handleChartMouseMove, handleChartMouseLeave };
};

export default {
  colorPalettes,
  multiColors,
  getColor,
  getShades,
  formatNumber,
  ChartTooltip,
  ChartLegend,
  ChartCrosshair,
  useCrosshairSnap,
};

import React, { useState, useRef, useEffect, useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { getColor, formatNumber, ChartTooltip, ChartLegend, multiColors } from './ChartUtils';

/**
 * BarChart Component
 * 
 * Variants:
 * - default: Basic vertical bar chart with consistent color
 * - grouped: Multiple series side by side
 * - stacked: Multiple series stacked on top
 * - horizontal: Horizontal bar chart
 * - gradient: Bars with gradient fill
 *
 * Features:
 * - Snap-to-bar hover with highlight and tooltip
 * - Configurable legends (position, shape, interactive toggle)
 * - Multi-series support
 */
const BarChart = forwardRef(({
  data = [],
  xKey = 'name',
  yKey = 'value',

  // Variant
  variant = 'default', // 'default' | 'grouped' | 'stacked' | 'horizontal' | 'gradient'

  // Appearance
  color = 'violet',
  theme = 'default',
  rounded = true,
  showGrid = true,
  showValues = false,
  animate = true,
  barRadius = 4,

  // Dimensions
  width = 400,
  height = 300,
  barWidth = 0.7,
  gap = 0.1,

  // Axes
  showXAxis = true,
  showYAxis = true,
  yAxisWidth = 50,
  xAxisHeight = 30,
  xAxisLabel = '',
  yAxisLabel = '',

  // Tooltip
  showTooltip = true,
  tooltipFormatter,

  // Legend
  showLegend = 'auto',
  legendPosition = 'bottom',
  legendAlign = 'center',
  legendShape = 'square',
  legendInteractive = false,

  className = '',
  ...props
}, ref) => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
  const [animationProgress, setAnimationProgress] = useState(animate ? 0 : 1);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(-1);
  const [hiddenSeries, setHiddenSeries] = useState(new Set());
  const containerRef = useRef(null);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimationProgress(1), 50);
      return () => clearTimeout(timer);
    }
  }, [animate, data]);

  // Handle horizontal variant dimensions
  const isHorizontal = variant === 'horizontal';
  const chartWidth = isHorizontal
    ? width - (showYAxis ? 80 : 0)
    : width - (showYAxis ? yAxisWidth : 0);
  const chartHeight = height - (showXAxis ? xAxisHeight : 0);
  const chartX = isHorizontal ? (showYAxis ? 80 : 0) : (showYAxis ? yAxisWidth : 0);

  // Get all y keys for stacked/grouped charts
  const yKeys = typeof yKey === 'string' ? [yKey] : yKey;
  const isMultiSeries = yKeys.length > 1;
  const visibleYKeys = yKeys.filter((_, i) => !hiddenSeries.has(i));

  // Calculate max value
  const maxValue = useMemo(() => {
    const keys = visibleYKeys.length > 0 ? visibleYKeys : yKeys;
    if (variant === 'stacked') {
      return Math.max(...data.map(d => keys.reduce((sum, key) => sum + (d[key] || 0), 0)));
    }
    return Math.max(...data.flatMap(d => keys.map(key => d[key] || 0)));
  }, [data, visibleYKeys, yKeys, variant]);

  // Calculate bar positions
  const barGap = (isHorizontal ? chartHeight : chartWidth) * gap / (data.length + 1);
  const totalBarSpace = isHorizontal ? chartHeight : chartWidth;
  const totalBarWidth = (totalBarSpace - barGap * (data.length + 1)) / data.length;
  const actualBarWidth = totalBarWidth * barWidth;
  const barOffset = (totalBarWidth - actualBarWidth) / 2;

  // Get bar color based on variant
  const getBarColor = (dataIndex, seriesIndex) => {
    if (variant === 'grouped' || variant === 'stacked') {
      return isMultiSeries ? multiColors[seriesIndex % multiColors.length] : getColor(color, 0);
    }
    return getColor(color, 0);
  };

  const gradientId = `bar-gradient-${color}`;

  // Snap-to-bar hover: finds nearest bar group by mouse position
  const handleChartMouseMove = useCallback((e) => {
    if (!showTooltip) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || data.length === 0) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let nearestIndex;
    if (isHorizontal) {
      // For horizontal, snap by Y
      nearestIndex = Math.floor((mouseY - barGap) / (totalBarWidth + barGap));
    } else {
      nearestIndex = Math.floor((mouseX - chartX - barGap) / (totalBarWidth + barGap));
    }
    nearestIndex = Math.max(0, Math.min(nearestIndex, data.length - 1));

    if (nearestIndex === hoveredBarIndex) return;
    setHoveredBarIndex(nearestIndex);

    const item = data[nearestIndex];
    const activeKeys = yKeys.filter((_, i) => !hiddenSeries.has(i));

    const content = tooltipFormatter
      ? tooltipFormatter(item, nearestIndex)
      : (
        <div className="text-slate-700 dark:text-slate-200 min-w-[120px]">
          <div className="font-medium text-slate-900 dark:text-white mb-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-700">
            {item[xKey]}
          </div>
          {activeKeys.map((key) => {
            const ki = yKeys.indexOf(key);
            return (
              <div key={key} className="flex items-center justify-between gap-3 py-0.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: getBarColor(nearestIndex, ki) }} />
                  <span className="capitalize text-xs text-slate-500 dark:text-slate-400">{key}</span>
                </div>
                <span className="font-semibold text-xs">{formatNumber(item[key] || 0)}</span>
              </div>
            );
          })}
        </div>
      );

    // Position tooltip near the bar
    let tipX, tipY;
    if (isHorizontal) {
      const value = item[yKeys[0]] || 0;
      tipX = chartX + (value / maxValue) * chartWidth;
      tipY = barGap + nearestIndex * (totalBarWidth + barGap) + totalBarWidth / 2;
    } else {
      tipX = chartX + barGap + nearestIndex * (totalBarWidth + barGap) + totalBarWidth / 2;
      const maxBarValue = Math.max(...activeKeys.map(key => item[key] || 0));
      tipY = chartHeight - (maxBarValue / maxValue) * chartHeight * animationProgress;
    }

    setTooltip({
      visible: true,
      x: tipX,
      y: tipY,
      content,
    });
  }, [data, chartX, chartWidth, chartHeight, totalBarWidth, barGap, isHorizontal, yKeys, xKey, showTooltip, tooltipFormatter, maxValue, animationProgress, hoveredBarIndex, hiddenSeries]);

  const handleChartMouseLeave = useCallback(() => {
    setHoveredBarIndex(-1);
    setTooltip({ visible: false, x: 0, y: 0, content: null });
  }, []);

  // Legend toggle
  const handleLegendToggle = useCallback((index) => {
    if (!legendInteractive) return;
    setHiddenSeries(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, [legendInteractive]);

  // Render Y axis
  const renderYAxis = () => {
    if (!showYAxis) return null;
    const ticks = 5;
    const tickValues = Array.from({ length: ticks }, (_, i) => (maxValue / (ticks - 1)) * i);

    if (isHorizontal) {
      return (
        <g className="y-axis">
          {data.map((item, i) => (
            <text
              key={i}
              x={chartX - 8}
              y={barGap + i * (totalBarWidth + barGap) + totalBarWidth / 2 + 4}
              textAnchor="end"
              className="text-[10px] fill-slate-500 dark:fill-slate-400"
            >
              {item[xKey]?.length > 10 ? item[xKey].slice(0, 10) + '...' : item[xKey]}
            </text>
          ))}
        </g>
      );
    }

    return (
      <g className="y-axis">
        {tickValues.map((tick, i) => (
          <g key={i}>
            <text
              x={yAxisWidth - 8}
              y={chartHeight - (tick / maxValue) * chartHeight + 4}
              textAnchor="end"
              className="text-[10px] fill-slate-500 dark:fill-slate-400"
            >
              {formatNumber(tick, true)}
            </text>
            {showGrid && (
              <line
                x1={chartX}
                y1={chartHeight - (tick / maxValue) * chartHeight}
                x2={width}
                y2={chartHeight - (tick / maxValue) * chartHeight}
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeDasharray="4,4"
              />
            )}
          </g>
        ))}
      </g>
    );
  };

  // Render axis labels
  const renderAxisLabels = () => {
    return (
      <>
        {xAxisLabel && !isHorizontal && (
          <text
            x={chartX + chartWidth / 2}
            y={height + 12}
            textAnchor="middle"
            className="text-[11px] fill-slate-600 dark:fill-slate-400 font-medium"
          >
            {xAxisLabel}
          </text>
        )}
        {yAxisLabel && !isHorizontal && (
          <text
            x={12}
            y={chartHeight / 2 - 10}
            textAnchor="middle"
            transform={`rotate(-90, 12, ${chartHeight / 2})`}
            className="text-[11px] fill-slate-600 dark:fill-slate-400 font-medium"
          >
            {yAxisLabel}
          </text>
        )}
        {xAxisLabel && isHorizontal && (
          <text
            x={chartX + chartWidth / 2}
            y={height + 12}
            textAnchor="middle"
            className="text-[11px] fill-slate-600 dark:fill-slate-400 font-medium"
          >
            {xAxisLabel}
          </text>
        )}
        {yAxisLabel && isHorizontal && (
          <text
            x={12}
            y={chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, 12, ${chartHeight / 2})`}
            className="text-[11px] fill-slate-600 dark:fill-slate-400 font-medium"
          >
            {yAxisLabel}
          </text>
        )}
      </>
    );
  };

  // Render X axis
  const renderXAxis = () => {
    if (!showXAxis) return null;

    if (isHorizontal) {
      const ticks = 5;
      const tickValues = Array.from({ length: ticks }, (_, i) => (maxValue / (ticks - 1)) * i);
      return (
        <g className="x-axis">
          {tickValues.map((tick, i) => (
            <g key={i}>
              <text
                x={chartX + (tick / maxValue) * chartWidth}
                y={chartHeight + 20}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 dark:fill-slate-400"
              >
                {formatNumber(tick, true)}
              </text>
              {showGrid && (
                <line
                  x1={chartX + (tick / maxValue) * chartWidth}
                  y1={0}
                  x2={chartX + (tick / maxValue) * chartWidth}
                  y2={chartHeight}
                  className="stroke-slate-200 dark:stroke-slate-700"
                  strokeDasharray="4,4"
                />
              )}
            </g>
          ))}
        </g>
      );
    }

    return (
      <g className="x-axis">
        {data.map((item, i) => (
          <text
            key={i}
            x={chartX + barGap + i * (totalBarWidth + barGap) + totalBarWidth / 2}
            y={chartHeight + 20}
            textAnchor="middle"
            className="text-[10px] fill-slate-500 dark:fill-slate-400"
          >
            {item[xKey]?.length > 8 ? item[xKey].slice(0, 8) + '...' : item[xKey]}
          </text>
        ))}
      </g>
    );
  };

  // Render bars based on variant
  const renderBars = () => {
    return data.map((item, i) => {
      const isHovered = hoveredBarIndex === i;
      const hoverOpacity = hoveredBarIndex >= 0 && !isHovered ? 0.6 : 1;

      if (isHorizontal) {
        const y = barGap + i * (totalBarWidth + barGap) + barOffset;
        const value = item[yKeys[0]] || 0;
        const barLength = (value / maxValue) * chartWidth * animationProgress;

        return (
          <rect
            key={i}
            x={chartX}
            y={y}
            width={barLength}
            height={actualBarWidth}
            fill={variant === 'gradient' ? `url(#${gradientId})` : getBarColor(i, 0)}
            rx={rounded ? barRadius : 0}
            opacity={hoverOpacity}
            className="transition-all duration-200 cursor-pointer"
          />
        );
      }

      const x = chartX + barGap + i * (totalBarWidth + barGap) + barOffset;

      if (variant === 'stacked' && isMultiSeries) {
        let currentY = 0;
        // Find the last visible key index to apply rounded corners only to the topmost bar
        const visibleKeyIndices = yKeys.map((_, ki) => ki).filter(ki => !hiddenSeries.has(ki));
        const lastVisibleKeyIndex = visibleKeyIndices.length > 0 ? visibleKeyIndices[visibleKeyIndices.length - 1] : -1;

        return yKeys.map((key, ki) => {
          if (hiddenSeries.has(ki)) return null;
          const value = item[key] || 0;
          const barHeight = (value / maxValue) * chartHeight * animationProgress;
          const y = chartHeight - currentY - barHeight;
          currentY += barHeight;

          // Only the topmost visible bar gets rounded corners
          const isLastVisible = ki === lastVisibleKeyIndex;

          return (
            <rect
              key={`${i}-${ki}`}
              x={x}
              y={y}
              width={actualBarWidth}
              height={barHeight}
              fill={getBarColor(i, ki)}
              rx={isLastVisible && rounded ? barRadius : 0}
              opacity={hoverOpacity}
              className="transition-all duration-200 cursor-pointer"
            />
          );
        });
      }

      if (variant === 'grouped' && isMultiSeries) {
        const activeKeys = yKeys.filter((_, ki) => !hiddenSeries.has(ki));
        const groupBarWidth = actualBarWidth / Math.max(activeKeys.length, 1);
        let activeIndex = 0;
        return yKeys.map((key, ki) => {
          if (hiddenSeries.has(ki)) return null;
          const value = item[key] || 0;
          const barHeight = (value / maxValue) * chartHeight * animationProgress;
          const barX = x + activeIndex * groupBarWidth;
          activeIndex++;

          return (
            <rect
              key={`${i}-${ki}`}
              x={barX}
              y={chartHeight - barHeight}
              width={groupBarWidth - 2}
              height={barHeight}
              fill={getBarColor(i, ki)}
              rx={rounded ? barRadius : 0}
              opacity={hoverOpacity}
              className="transition-all duration-200 cursor-pointer"
            />
          );
        });
      }

      // Default single bar
      const value = item[yKeys[0]] || 0;
      const barHeight = (value / maxValue) * chartHeight * animationProgress;

      return (
        <g key={i}>
          <rect
            x={x}
            y={chartHeight - barHeight}
            width={actualBarWidth}
            height={barHeight}
            fill={variant === 'gradient' ? `url(#${gradientId})` : getBarColor(i, 0)}
            rx={rounded ? barRadius : 0}
            opacity={hoverOpacity}
            className="transition-all duration-200 cursor-pointer"
          />
          {showValues && (
            <text
              x={x + actualBarWidth / 2}
              y={chartHeight - barHeight - 8}
              textAnchor="middle"
              className="text-[10px] fill-slate-600 dark:fill-slate-400 font-medium"
            >
              {formatNumber(value, true)}
            </text>
          )}
        </g>
      );
    });
  };

  // Render hover highlight bar (subtle background highlight on hovered group)
  const renderHoverHighlight = () => {
    if (hoveredBarIndex < 0 || isHorizontal) return null;
    const x = chartX + barGap + hoveredBarIndex * (totalBarWidth + barGap) - 2;
    return (
      <rect
        x={x}
        y={0}
        width={totalBarWidth + 4}
        height={chartHeight}
        fill="currentColor"
        className="text-slate-500/5 dark:text-slate-300/5"
        rx={4}
        style={{ pointerEvents: 'none' }}
      />
    );
  };

  const shouldShowLegend = showLegend === true || (showLegend === 'auto' && isMultiSeries);

  const legendItems = yKeys.map((key, i) => ({
    color: isMultiSeries ? multiColors[i % multiColors.length] : getColor(color, 0),
    label: key,
    inactive: hiddenSeries.has(i),
  }));

  const isLegendSide = legendPosition === 'left' || legendPosition === 'right';

  return (
    <div
      ref={containerRef}
      className={`relative ${isLegendSide && shouldShowLegend ? 'flex items-center' : ''} ${className}`}
      {...props}
    >
      {shouldShowLegend && legendPosition === 'top' && (
        <ChartLegend items={legendItems} position="top" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} />
      )}
      {shouldShowLegend && legendPosition === 'left' && (
        <ChartLegend items={legendItems} position="left" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} layout="vertical" />
      )}
      <div className="relative">
        <svg ref={ref} width={width} height={height} className="overflow-visible">
          {variant === 'gradient' && (
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={getColor(color, 0)} />
                <stop offset="100%" stopColor={getColor(color, 2)} />
              </linearGradient>
            </defs>
          )}

          {renderYAxis()}
          {renderXAxis()}
          {renderAxisLabels()}
          {renderHoverHighlight()}
          {renderBars()}

          {/* Invisible overlay for mouse tracking */}
          <rect
            x={isHorizontal ? chartX : chartX}
            y={0}
            width={isHorizontal ? chartWidth : chartWidth + barGap * 2}
            height={chartHeight}
            fill="transparent"
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
            className="cursor-pointer"
          />
        </svg>
        <ChartTooltip {...tooltip} theme={theme} chartRef={containerRef} />
      </div>
      {shouldShowLegend && legendPosition === 'right' && (
        <ChartLegend items={legendItems} position="right" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} layout="vertical" />
      )}
      {shouldShowLegend && (legendPosition === 'bottom' || !legendPosition) && (
        <ChartLegend items={legendItems} position="bottom" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} />
      )}
    </div>
  );
});

BarChart.displayName = 'BarChart';

BarChart.propTypes = {
  data: PropTypes.array,
  xKey: PropTypes.string,
  yKey: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  variant: PropTypes.oneOf(['default', 'grouped', 'stacked', 'horizontal', 'gradient']),
  color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'slate']),
  theme: PropTypes.oneOf(['default', 'glass', 'dark']),
  rounded: PropTypes.bool,
  showGrid: PropTypes.bool,
  showValues: PropTypes.bool,
  animate: PropTypes.bool,
  barRadius: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  barWidth: PropTypes.number,
  gap: PropTypes.number,
  showXAxis: PropTypes.bool,
  showYAxis: PropTypes.bool,
  yAxisWidth: PropTypes.number,
  xAxisHeight: PropTypes.number,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string,
  showTooltip: PropTypes.bool,
  tooltipFormatter: PropTypes.func,
  showLegend: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['auto'])]),
  legendPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  legendAlign: PropTypes.oneOf(['start', 'center', 'end']),
  legendShape: PropTypes.oneOf(['circle', 'square', 'line', 'dashed', 'diamond']),
  legendInteractive: PropTypes.bool,
  className: PropTypes.string,
};

export default BarChart;

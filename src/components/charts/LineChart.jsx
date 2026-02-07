import React, { useState, useRef, useEffect, useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { getColor, formatNumber, ChartTooltip, ChartLegend, ChartCrosshair, multiColors } from './ChartUtils';

/**
 * LineChart Component
 * 
 * Variants:
 * - default/straight: Sharp/angular lines (default)
 * - curved: Smooth bezier curved line chart
 * - stepped: Step-style lines
 * - dotted: Lines with emphasized dots
 * - gradient: Line with gradient stroke
 *
 * Features:
 * - Crosshair snap-to-point hover (smooth UX)
 * - Configurable legends (position, shape, interactive toggle)
 * - Multi-series support
 */
const LineChart = forwardRef(({
  data = [],
  xKey = 'name',
  yKey = 'value',

  // Variant
  variant = 'curved', // 'curved' | 'straight' | 'stepped' | 'dotted' | 'gradient'

  // Appearance
  color = 'violet',
  theme = 'default',
  showDots = false,
  showGrid = true,
  animate = true,
  strokeWidth = 2,
  dotSize = 4,

  // Dimensions
  width = 400,
  height = 300,

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
  showLegend = 'auto',        // true | false | 'auto' (auto shows for multi-series)
  legendPosition = 'bottom',  // 'top' | 'bottom' | 'left' | 'right'
  legendAlign = 'center',     // 'start' | 'center' | 'end'
  legendShape = 'line',       // 'circle' | 'square' | 'line' | 'dashed' | 'diamond'
  legendInteractive = false,  // click to toggle series visibility

  className = '',
  ...props
}, ref) => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
  const [animationProgress, setAnimationProgress] = useState(animate ? 0 : 1);
  const [crosshair, setCrosshair] = useState({ visible: false, x: 0, index: -1, points: [] });
  const [hiddenSeries, setHiddenSeries] = useState(new Set());
  const containerRef = useRef(null);

  // Unique ID for this component instance to prevent gradient ID conflicts
  const uniqueId = useRef(`line-${Math.random().toString(36).substr(2, 9)}`).current;

  useEffect(() => {
    if (animate) {
      let start;
      const duration = 800;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setAnimationProgress(progress);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, [animate, data]);

  // Add top padding to prevent labels and line from being clipped
  const topPadding = 15;
  const chartWidth = width - (showYAxis ? yAxisWidth : 0);
  const chartHeight = height - (showXAxis ? xAxisHeight : 0) - topPadding;
  const chartX = showYAxis ? yAxisWidth : 0;
  const chartY = topPadding;

  const yKeys = typeof yKey === 'string' ? [yKey] : yKey;
  const isMultiSeries = yKeys.length > 1;

  const visibleYKeys = yKeys.filter((_, i) => !hiddenSeries.has(i));

  const maxValue = useMemo(() => {
    const keys = visibleYKeys.length > 0 ? visibleYKeys : yKeys;
    return Math.max(...data.flatMap(d => keys.map(key => d[key] || 0))) * 1.1;
  }, [data, visibleYKeys, yKeys]);

  const minValue = useMemo(() => {
    const keys = visibleYKeys.length > 0 ? visibleYKeys : yKeys;
    const min = Math.min(...data.flatMap(d => keys.map(key => d[key] || 0)));
    return min > 0 ? 0 : min * 1.1;
  }, [data, visibleYKeys, yKeys]);

  const valueRange = maxValue - minValue;

  // Calculate points
  const getPoints = (key) => {
    return data.map((item, i) => {
      const x = chartX + (i / Math.max(data.length - 1, 1)) * chartWidth;
      const value = item[key] || 0;
      const y = chartY + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      return { x, y, value, item };
    });
  };

  // Generate path based on variant
  const generatePath = (points) => {
    if (points.length < 2) return '';

    const visiblePoints = points.slice(0, Math.ceil(points.length * animationProgress) || 1);

    if (variant === 'stepped') {
      let path = `M ${visiblePoints[0].x} ${visiblePoints[0].y}`;
      for (let i = 1; i < visiblePoints.length; i++) {
        const curr = visiblePoints[i];
        path += ` H ${curr.x} V ${curr.y}`;
      }
      return path;
    }

    if (variant === 'curved') {
      // Monotone cubic spline interpolation for smooth, natural curves
      // Similar to D3's curveMonotoneX - preserves monotonicity and doesn't overshoot
      if (visiblePoints.length < 2) return '';
      if (visiblePoints.length === 2) {
        return `M ${visiblePoints[0].x} ${visiblePoints[0].y} L ${visiblePoints[1].x} ${visiblePoints[1].y}`;
      }

      // Calculate tangents using finite differences (monotone variant)
      const n = visiblePoints.length;
      const tangents = [];

      for (let i = 0; i < n; i++) {
        if (i === 0) {
          // First point: use forward difference
          tangents.push((visiblePoints[1].y - visiblePoints[0].y) / (visiblePoints[1].x - visiblePoints[0].x));
        } else if (i === n - 1) {
          // Last point: use backward difference
          tangents.push((visiblePoints[n - 1].y - visiblePoints[n - 2].y) / (visiblePoints[n - 1].x - visiblePoints[n - 2].x));
        } else {
          // Interior points: use average of adjacent slopes
          const slopeLeft = (visiblePoints[i].y - visiblePoints[i - 1].y) / (visiblePoints[i].x - visiblePoints[i - 1].x);
          const slopeRight = (visiblePoints[i + 1].y - visiblePoints[i].y) / (visiblePoints[i + 1].x - visiblePoints[i].x);

          // If slopes have different signs, set tangent to 0 (local min/max)
          if (slopeLeft * slopeRight <= 0) {
            tangents.push(0);
          } else {
            // Use harmonic mean for smoother curves
            tangents.push(2 / (1 / slopeLeft + 1 / slopeRight));
          }
        }
      }

      // Generate cubic bezier path
      let path = `M ${visiblePoints[0].x} ${visiblePoints[0].y}`;

      for (let i = 0; i < n - 1; i++) {
        const p0 = visiblePoints[i];
        const p1 = visiblePoints[i + 1];
        const dx = (p1.x - p0.x) / 3;

        const cp1x = p0.x + dx;
        const cp1y = p0.y + tangents[i] * dx;
        const cp2x = p1.x - dx;
        const cp2y = p1.y - tangents[i + 1] * dx;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
      }

      return path;
    }

    // Default/straight/dotted lines
    return visiblePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  // Get line color
  const getLineColor = (index) => {
    if (isMultiSeries) {
      return multiColors[index % multiColors.length];
    }
    return getColor(color, 0);
  };

  // Crosshair snap-to-point handler
  const handleChartMouseMove = useCallback((e) => {
    if (!showTooltip && !showDots) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || data.length === 0) return;

    const mouseX = e.clientX - rect.left;

    // Snap to nearest data point
    const stepWidth = chartWidth / Math.max(data.length - 1, 1);
    let nearestIndex = Math.round((mouseX - chartX) / stepWidth);
    nearestIndex = Math.max(0, Math.min(nearestIndex, data.length - 1));

    const snapX = chartX + (nearestIndex / Math.max(data.length - 1, 1)) * chartWidth;
    const item = data[nearestIndex];

    // Get Y positions for all visible series
    const points = yKeys.map((key, ki) => {
      const value = item[key] || 0;
      const y = chartY + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      return { y, color: getLineColor(ki), value, key };
    }).filter((_, ki) => !hiddenSeries.has(ki));

    setCrosshair({ visible: true, x: snapX, index: nearestIndex, points });

    if (showTooltip) {
      const content = tooltipFormatter
        ? tooltipFormatter(item, nearestIndex)
        : (
          <div className="text-slate-700 dark:text-slate-200 min-w-[120px]">
            <div className="font-medium text-slate-900 dark:text-white mb-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-700">
              {item[xKey]}
            </div>
            {yKeys.filter((_, ki) => !hiddenSeries.has(ki)).map((key, ki) => (
              <div key={key} className="flex items-center justify-between gap-3 py-0.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getLineColor(yKeys.indexOf(key)) }} />
                  <span className="capitalize text-xs text-slate-500 dark:text-slate-400">{key}</span>
                </div>
                <span className="font-semibold text-xs">{formatNumber(item[key] || 0)}</span>
              </div>
            ))}
          </div>
        );

      setTooltip({
        visible: true,
        x: snapX,
        y: Math.min(...points.map(p => p.y)),
        content,
      });
    }
  }, [data, chartX, chartWidth, chartHeight, yKeys, minValue, valueRange, xKey, showTooltip, tooltipFormatter, hiddenSeries, showDots, getLineColor]);

  const handleChartMouseLeave = useCallback(() => {
    setCrosshair({ visible: false, x: 0, index: -1, points: [] });
    setTooltip({ visible: false, x: 0, y: 0, content: null });
  }, []);

  // Legend toggle handler
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
    const tickValues = Array.from({ length: ticks }, (_, i) => minValue + (valueRange / (ticks - 1)) * i);

    return (
      <g className="y-axis">
        {tickValues.map((tick, i) => (
          <g key={i}>
            <text
              x={yAxisWidth - 8}
              y={chartY + chartHeight - ((tick - minValue) / valueRange) * chartHeight + 4}
              textAnchor="end"
              className="text-[10px] fill-slate-500 dark:fill-slate-400"
            >
              {formatNumber(tick, true)}
            </text>
            {showGrid && (
              <line
                x1={chartX}
                y1={chartY + chartHeight - ((tick - minValue) / valueRange) * chartHeight}
                x2={width}
                y2={chartY + chartHeight - ((tick - minValue) / valueRange) * chartHeight}
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeDasharray="4,4"
              />
            )}
          </g>
        ))}
      </g>
    );
  };

  // Render X axis
  const renderXAxis = () => {
    if (!showXAxis) return null;
    const step = Math.ceil(data.length / 6);

    return (
      <g className="x-axis">
        {data.filter((_, i) => i % step === 0).map((item, idx) => {
          const i = idx * step;
          return (
            <text
              key={i}
              x={chartX + (i / Math.max(data.length - 1, 1)) * chartWidth}
              y={chartY + chartHeight + 20}
              textAnchor="middle"
              className="text-[10px] fill-slate-500 dark:fill-slate-400"
            >
              {item[xKey]}
            </text>
          );
        })}
      </g>
    );
  };

  // Render axis labels
  const renderAxisLabels = () => {
    return (
      <>
        {xAxisLabel && (
          <text
            x={chartX + chartWidth / 2}
            y={height - 2}
            textAnchor="middle"
            className="text-[11px] fill-slate-600 dark:fill-slate-400 font-medium"
          >
            {xAxisLabel}
          </text>
        )}
        {yAxisLabel && (
          <text
            x={12}
            y={chartY + chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, 12, ${chartY + chartHeight / 2})`}
            className="text-[11px] fill-slate-600 dark:fill-slate-400 font-medium"
          >
            {yAxisLabel}
          </text>
        )}
      </>
    );
  };

  // Determine legend visibility
  const shouldShowLegend = showLegend === true || (showLegend === 'auto' && isMultiSeries);

  // Build legend items
  const legendItems = yKeys.map((key, i) => ({
    color: getLineColor(i),
    label: key,
    inactive: hiddenSeries.has(i),
  }));

  const gradientId = `${uniqueId}-gradient`;

  // Wrap chart in flex container if legend is left/right
  const isLegendSide = legendPosition === 'left' || legendPosition === 'right';

  return (
    <div
      ref={containerRef}
      className={`relative ${isLegendSide && shouldShowLegend ? 'flex items-center' : ''} ${className}`}
      {...props}
    >
      {shouldShowLegend && legendPosition === 'top' && (
        <ChartLegend
          items={legendItems}
          position="top"
          align={legendAlign}
          shape={legendShape}
          interactive={legendInteractive}
          onToggle={handleLegendToggle}
        />
      )}
      {shouldShowLegend && legendPosition === 'left' && (
        <ChartLegend
          items={legendItems}
          position="left"
          align={legendAlign}
          shape={legendShape}
          interactive={legendInteractive}
          onToggle={handleLegendToggle}
          layout="vertical"
        />
      )}
      <div className="relative">
        <svg ref={ref} width={width} height={height} className="overflow-visible">
          {/* Gradient definition */}
          {variant === 'gradient' && (
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={getColor(color, 0)} />
                <stop offset="50%" stopColor={getColor(color, 1)} />
                <stop offset="100%" stopColor={getColor(color, 2)} />
              </linearGradient>
            </defs>
          )}

          {renderYAxis()}
          {renderXAxis()}
          {renderAxisLabels()}

          {yKeys.map((key, ki) => {
            if (hiddenSeries.has(ki)) return null;
            const points = getPoints(key);
            const lineColor = variant === 'gradient' ? `url(#${gradientId})` : getLineColor(ki);

            return (
              <g key={key}>
                <path
                  d={generatePath(points)}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={variant === 'dotted' ? '0.1,8' : 'none'}
                  className="transition-all duration-300"
                />

                {/* Secondary solid line for dotted variant */}
                {variant === 'dotted' && (
                  <path
                    d={generatePath(points)}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth={1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity={0.3}
                    className="transition-all duration-300"
                  />
                )}

                {/* Static dots (only when crosshair is NOT active for cleaner UX) */}
                {(showDots || variant === 'dotted') && !crosshair.visible &&
                  points.slice(0, Math.ceil(points.length * animationProgress)).map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r={variant === 'dotted' ? dotSize + 2 : dotSize}
                      fill="white"
                      stroke={getLineColor(ki)}
                      strokeWidth={2}
                      className="transition-all duration-200"
                    />
                  ))
                }
              </g>
            );
          })}

          {/* Crosshair snap overlay */}
          <ChartCrosshair
            x={crosshair.x}
            visible={crosshair.visible}
            chartHeight={chartHeight}
            chartY={chartY}
            points={crosshair.points}
          />

          {/* Invisible overlay rect for mouse tracking */}
          <rect
            x={chartX}
            y={0}
            width={chartWidth}
            height={chartHeight}
            fill="transparent"
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
            className="cursor-crosshair"
          />
        </svg>
        <ChartTooltip {...tooltip} theme={theme} chartRef={containerRef} />
      </div>
      {shouldShowLegend && legendPosition === 'right' && (
        <ChartLegend
          items={legendItems}
          position="right"
          align={legendAlign}
          shape={legendShape}
          interactive={legendInteractive}
          onToggle={handleLegendToggle}
          layout="vertical"
        />
      )}
      {shouldShowLegend && (legendPosition === 'bottom' || !legendPosition) && (
        <ChartLegend
          items={legendItems}
          position="bottom"
          align={legendAlign}
          shape={legendShape}
          interactive={legendInteractive}
          onToggle={handleLegendToggle}
        />
      )}
    </div>
  );
});

LineChart.displayName = 'LineChart';

LineChart.propTypes = {
  data: PropTypes.array,
  xKey: PropTypes.string,
  yKey: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  variant: PropTypes.oneOf(['curved', 'straight', 'stepped', 'dotted', 'gradient']),
  color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'slate']),
  theme: PropTypes.oneOf(['default', 'glass', 'dark']),
  showDots: PropTypes.bool,
  showGrid: PropTypes.bool,
  animate: PropTypes.bool,
  strokeWidth: PropTypes.number,
  dotSize: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
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

export default LineChart;

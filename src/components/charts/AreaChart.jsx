import React, { useState, useRef, useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { getColor, formatNumber, ChartTooltip, ChartLegend, ChartCrosshair, multiColors, useChartResize, useChartMount, CSS_EASE } from './ChartUtils';

/**
 * AreaChart Component
 * 
 * Variants:
 * - default: Basic filled area chart with straight lines (default)
 * - curved: Smooth bezier curved area chart
 * - stacked: Multiple stacked areas
 * - gradient: Area with gradient fill
 * - stepped: Step-style area
 *
 * Features:
 * - Crosshair snap-to-point hover (smooth UX)
 * - Configurable legends (position, shape, interactive toggle)
 * - Multi-series & stacked support
 */
const AreaChart = forwardRef(({
  data = [],
  xKey = 'name',
  yKey = 'value',

  // Variant
  variant = 'curved', // 'curved' | 'straight' | 'stacked' | 'gradient' | 'stepped'

  // Appearance
  color = 'violet',
  theme = 'default',
  showDots = false,
  showGrid = true,
  showLine = true,
  animate = true,
  strokeWidth = 2,
  dotSize = 4,
  fillOpacity = 0.2,

  // Dimensions
  width = 400,
  height = 300,
  responsive = false,

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
  const [crosshair, setCrosshair] = useState({ visible: false, x: 0, index: -1, points: [] });
  const [hiddenSeries, setHiddenSeries] = useState(new Set());
  const containerRef = useRef(null);
  const mounted = useChartMount(animate);
  const [resizeRef, chartW, chartH] = useChartResize(responsive, width, height, 400, 300);
  const widthToUse = chartW;
  const heightToUse = chartH;

  // Unique ID for this component instance to prevent gradient/clip ID conflicts
  const uniqueId = useRef(`area-${Math.random().toString(36).substr(2, 9)}`).current;
  const clipId = `${uniqueId}-clip`;

  // Add top padding to prevent labels and line from being clipped
  const topPadding = 15;
  const chartWidth = widthToUse - (showYAxis ? yAxisWidth : 0);
  const chartHeight = heightToUse - (showXAxis ? xAxisHeight : 0) - topPadding;
  const chartX = showYAxis ? yAxisWidth : 0;
  const chartY = topPadding;

  const yKeys = typeof yKey === 'string' ? [yKey] : yKey;
  const isMultiSeries = yKeys.length > 1;
  const isStacked = variant === 'stacked' && isMultiSeries;
  const visibleYKeys = yKeys.filter((_, i) => !hiddenSeries.has(i));

  const maxValue = useMemo(() => {
    const keys = visibleYKeys.length > 0 ? visibleYKeys : yKeys;
    if (isStacked) {
      return Math.max(...data.map(d => keys.reduce((sum, key) => sum + (d[key] || 0), 0))) * 1.1;
    }
    return Math.max(...data.flatMap(d => keys.map(key => d[key] || 0))) * 1.1;
  }, [data, visibleYKeys, yKeys, isStacked]);

  const minValue = 0;
  const valueRange = maxValue - minValue;

  // Calculate points for a series
  const getPoints = (key, stackedValues = null) => {
    return data.map((item, i) => {
      const x = chartX + (i / Math.max(data.length - 1, 1)) * chartWidth;
      const value = item[key] || 0;
      const stackedBase = stackedValues ? stackedValues[i] : 0;
      const y = chartY + chartHeight - ((value + stackedBase - minValue) / valueRange) * chartHeight;
      return { x, y, value, item, stackedBase };
    });
  };

  // Generate line path
  const generateLinePath = (points, smooth = variant === 'curved') => {
    if (points.length < 2) return '';

    if (variant === 'stepped') {
      let path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const curr = points[i];
        path += ` H ${curr.x} V ${curr.y}`;
      }
      return path;
    }

    if (!smooth) {
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }

    // Monotone cubic spline interpolation for smooth, natural curves
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    const n = points.length;
    const tangents = [];

    for (let i = 0; i < n; i++) {
      if (i === 0) {
        tangents.push((points[1].y - points[0].y) / (points[1].x - points[0].x));
      } else if (i === n - 1) {
        tangents.push((points[n - 1].y - points[n - 2].y) / (points[n - 1].x - points[n - 2].x));
      } else {
        const slopeLeft = (points[i].y - points[i - 1].y) / (points[i].x - points[i - 1].x);
        const slopeRight = (points[i + 1].y - points[i].y) / (points[i + 1].x - points[i].x);

        if (slopeLeft * slopeRight <= 0) {
          tangents.push(0);
        } else {
          tangents.push(2 / (1 / slopeLeft + 1 / slopeRight));
        }
      }
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < n - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const dx = (p1.x - p0.x) / 3;

      const cp1x = p0.x + dx;
      const cp1y = p0.y + tangents[i] * dx;
      const cp2x = p1.x - dx;
      const cp2y = p1.y - tangents[i + 1] * dx;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }

    return path;
  };

  // Generate area path
  const generateAreaPath = (points, basePoints = null) => {
    const linePath = generateLinePath(points);
    if (!linePath) return '';

    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];

    if (basePoints && variant === 'stacked') {
      const reversedBase = [...basePoints].reverse();

      // Calculate base Y coordinates
      const baseYPoints = reversedBase.map(curr => ({
        x: curr.x,
        y: chartY + chartHeight - ((curr.stackedBase - minValue) / valueRange) * chartHeight
      }));

      // Start closing path from last point to the base
      let closePath = ` L ${lastPoint.x} ${baseYPoints[0].y}`;

      if (variant === 'stepped') {
        for (let i = 0; i < reversedBase.length; i++) {
          const curr = reversedBase[i];
          const baseY = chartY + chartHeight - ((curr.stackedBase - minValue) / valueRange) * chartHeight;
          if (i === 0) continue;
          closePath += ` V ${baseY} H ${curr.x}`;
        }
      } else if (variant === 'curved' && baseYPoints.length > 2) {
        // Use monotone cubic spline for smooth return path
        const n = baseYPoints.length;
        const tangents = [];

        for (let i = 0; i < n; i++) {
          if (i === 0) {
            tangents.push((baseYPoints[1].y - baseYPoints[0].y) / (baseYPoints[1].x - baseYPoints[0].x));
          } else if (i === n - 1) {
            tangents.push((baseYPoints[n - 1].y - baseYPoints[n - 2].y) / (baseYPoints[n - 1].x - baseYPoints[n - 2].x));
          } else {
            const slopeLeft = (baseYPoints[i].y - baseYPoints[i - 1].y) / (baseYPoints[i].x - baseYPoints[i - 1].x);
            const slopeRight = (baseYPoints[i + 1].y - baseYPoints[i].y) / (baseYPoints[i + 1].x - baseYPoints[i].x);

            if (slopeLeft * slopeRight <= 0) {
              tangents.push(0);
            } else {
              tangents.push(2 / (1 / slopeLeft + 1 / slopeRight));
            }
          }
        }

        for (let i = 0; i < n - 1; i++) {
          const p0 = baseYPoints[i];
          const p1 = baseYPoints[i + 1];
          const dx = (p1.x - p0.x) / 3;

          const cp1x = p0.x + dx;
          const cp1y = p0.y + tangents[i] * dx;
          const cp2x = p1.x - dx;
          const cp2y = p1.y - tangents[i + 1] * dx;

          closePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }
      } else {
        // Straight lines for non-smooth or 2 points
        for (let i = 1; i < baseYPoints.length; i++) {
          closePath += ` L ${baseYPoints[i].x} ${baseYPoints[i].y}`;
        }
      }
      closePath += ' Z';
      return linePath + closePath;
    }

    return `${linePath} L ${lastPoint.x} ${chartY + chartHeight} L ${firstPoint.x} ${chartY + chartHeight} Z`;
  };

  // Get colors
  const getAreaColor = (index) => {
    if (isMultiSeries) {
      return multiColors[index % multiColors.length];
    }
    return getColor(color, 0);
  };

  // Calculate all points (for stacked, we need cumulative values)
  const allPoints = useMemo(() => {
    const result = [];
    const stackedValues = data.map(() => 0);

    yKeys.forEach((key, ki) => {
      if (hiddenSeries.has(ki)) {
        result.push({ key, points: [], index: ki, hidden: true });
        return;
      }
      const points = getPoints(key, isStacked ? [...stackedValues] : null);
      result.push({ key, points, index: ki, hidden: false });

      if (isStacked) {
        data.forEach((item, i) => {
          stackedValues[i] += item[key] || 0;
        });
      }
    });

    return result;
  }, [data, yKeys, isStacked, chartHeight, chartWidth, chartX, valueRange, minValue, hiddenSeries]);

  // Crosshair snap-to-point handler
  const handleChartMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || data.length === 0) return;

    const mouseX = e.clientX - rect.left;

    const stepWidth = chartWidth / Math.max(data.length - 1, 1);
    let nearestIndex = Math.round((mouseX - chartX) / stepWidth);
    nearestIndex = Math.max(0, Math.min(nearestIndex, data.length - 1));

    const snapX = chartX + (nearestIndex / Math.max(data.length - 1, 1)) * chartWidth;
    const item = data[nearestIndex];

    const points = allPoints
      .filter(ap => !ap.hidden && ap.points[nearestIndex])
      .map(ap => ({
        y: ap.points[nearestIndex].y,
        color: getAreaColor(ap.index),
        value: ap.points[nearestIndex].value,
        key: ap.key,
      }));

    setCrosshair({ visible: true, x: snapX, index: nearestIndex, points });

    if (showTooltip) {
      const content = tooltipFormatter
        ? tooltipFormatter(item, nearestIndex)
        : (
          <div className="text-slate-700 dark:text-slate-200 min-w-[120px]">
            <div className="font-medium text-slate-900 dark:text-white mb-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-700">
              {item[xKey]}
            </div>
            {points.map((p) => (
              <div key={p.key} className="flex items-center justify-between gap-3 py-0.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="capitalize text-xs text-slate-500 dark:text-slate-400">{p.key}</span>
                </div>
                <span className="font-semibold text-xs">{formatNumber(p.value)}</span>
              </div>
            ))}
          </div>
        );

      setTooltip({
        visible: true,
        x: snapX,
        y: points.length > 0 ? Math.min(...points.map(p => p.y)) : 0,
        content,
      });
    }
  }, [data, chartX, chartWidth, allPoints, xKey, showTooltip, tooltipFormatter, getAreaColor]);

  const handleChartMouseLeave = useCallback(() => {
    setCrosshair({ visible: false, x: 0, index: -1, points: [] });
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

  // Render axes
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
                x2={widthToUse}
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
            y={heightToUse - 2}
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

  const shouldShowLegend = showLegend === true || (showLegend === 'auto' && isMultiSeries);

  const legendItems = yKeys.map((key, i) => ({
    color: getAreaColor(i),
    label: key,
    inactive: hiddenSeries.has(i),
  }));

  const gradientId = `${uniqueId}-gradient`;
  const isLegendSide = legendPosition === 'left' || legendPosition === 'right';

  const wrapperRef = (el) => {
    containerRef.current = el;
    if (resizeRef) resizeRef.current = el;
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative ${responsive ? 'w-full' : ''} ${isLegendSide && shouldShowLegend ? 'flex items-center' : ''} ${className}`}
      style={responsive ? { minHeight: heightToUse } : undefined}
      {...props}
    >
      {shouldShowLegend && legendPosition === 'top' && (
        <ChartLegend items={legendItems} position="top" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} />
      )}
      {shouldShowLegend && legendPosition === 'left' && (
        <ChartLegend items={legendItems} position="left" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} layout="vertical" />
      )}
      <div className="relative">
        <svg ref={ref} width={widthToUse} height={heightToUse} viewBox={`0 0 ${widthToUse} ${heightToUse}`} style={{ maxWidth: '100%', height: 'auto' }} className="overflow-visible">
          <defs>
            {/* Gradient definitions */}
            {variant === 'gradient' ? (
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={getColor(color, 0)} stopOpacity={0.6} />
                <stop offset="100%" stopColor={getColor(color, 0)} stopOpacity={0.05} />
              </linearGradient>
            ) : (
              yKeys.map((_, i) => (
                <linearGradient key={i} id={`${uniqueId}-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={getAreaColor(i)} stopOpacity={fillOpacity + 0.2} />
                  <stop offset="100%" stopColor={getAreaColor(i)} stopOpacity={0.05} />
                </linearGradient>
              ))
            )}
            {/* Clip path for smooth left-to-right reveal animation */}
            {animate && (
              <clipPath id={clipId}>
                <rect
                  x={chartX}
                  y={0}
                  width={chartWidth}
                  height={heightToUse}
                  style={{
                    transform: mounted ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: `${chartX}px 0`,
                    transition: `transform 1s ${CSS_EASE}`,
                  }}
                />
              </clipPath>
            )}
          </defs>

          {renderYAxis()}
          {renderXAxis()}
          {renderAxisLabels()}

          {/* Render areas with clip-path animation */}
          <g clipPath={animate ? `url(#${clipId})` : undefined}>
            {(isStacked ? [...allPoints].reverse() : allPoints).filter(ap => !ap.hidden).map(({ key, points, index }) => {
              const areaColor = getAreaColor(index);
              const prevPoints = isStacked && index > 0 ? allPoints[index - 1].points : null;

              return (
                <g key={key}>
                  <path
                    d={generateAreaPath(points, prevPoints)}
                    fill={variant === 'gradient' ? `url(#${gradientId})` : `url(#${uniqueId}-${index})`}
                    className="transition-all duration-300"
                  />

                  {showLine && (
                    <path
                      d={generateLinePath(points)}
                      fill="none"
                      stroke={areaColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300"
                    />
                  )}

                  {showDots && !crosshair.visible && points.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r={dotSize}
                      fill="white"
                      stroke={areaColor}
                      strokeWidth={2}
                      className="transition-all duration-200"
                    />
                  ))}
                </g>
              );
            })}
          </g>

          {/* Crosshair snap overlay */}
          <ChartCrosshair
            x={crosshair.x}
            visible={crosshair.visible}
            chartHeight={chartHeight}
            chartY={chartY}
            points={crosshair.points}
          />

          {/* Invisible overlay for mouse tracking */}
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
        <ChartLegend items={legendItems} position="right" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} layout="vertical" />
      )}
      {shouldShowLegend && (legendPosition === 'bottom' || !legendPosition) && (
        <ChartLegend items={legendItems} position="bottom" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} />
      )}
    </div>
  );
});

AreaChart.displayName = 'AreaChart';

AreaChart.propTypes = {
  data: PropTypes.array,
  xKey: PropTypes.string,
  yKey: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  variant: PropTypes.oneOf(['curved', 'straight', 'stacked', 'gradient', 'stepped']),
  color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'slate']),
  theme: PropTypes.oneOf(['default', 'glass', 'dark']),
  showDots: PropTypes.bool,
  showGrid: PropTypes.bool,
  showLine: PropTypes.bool,
  animate: PropTypes.bool,
  strokeWidth: PropTypes.number,
  dotSize: PropTypes.number,
  fillOpacity: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  responsive: PropTypes.bool,
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

export default AreaChart;

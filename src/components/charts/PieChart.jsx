import React, { useState, useRef, useEffect, useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { colorPalettes, formatNumber, ChartTooltip, ChartLegend } from './ChartUtils';

/**
 * PieChart Component
 * 
 * Uses shades of the same color to represent parts of a whole
 * 
 * Variants:
 * - default: Basic pie chart with color shades
 * - donut: Donut chart with center hole
 * - semi: Semi-circle pie chart
 * - rose: Variable radius based on value
 * - exploded: Slices separated from center
 *
 * Features:
 * - Interactive legend (click to toggle slice visibility)
 * - Configurable legend position, shape, alignment
 * - Hover highlight with tooltip snap
 */
const PieChart = forwardRef(({
  data = [],
  valueKey = 'value',
  nameKey = 'name',

  // Variant
  variant = 'default', // 'default' | 'donut' | 'semi' | 'rose' | 'exploded'

  // Appearance
  color = 'violet',
  theme = 'default',
  showLabels = false,
  showPercentage = true,
  animate = true,

  // Donut specific
  donutWidth = 60,
  centerContent = null,

  // Dimensions
  width = 300,
  height = 300,

  // Tooltip
  showTooltip = true,
  tooltipFormatter,

  // Legend
  showLegend = true,
  legendPosition = 'bottom',
  legendAlign = 'center',
  legendShape = 'circle',
  legendInteractive = false,

  className = '',
  ...props
}, ref) => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
  const [animationProgress, setAnimationProgress] = useState(animate ? 0 : 1);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hiddenSlices, setHiddenSlices] = useState(new Set());
  const containerRef = useRef(null);

  useEffect(() => {
    if (animate) {
      let start;
      const duration = 1000;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setAnimationProgress(progress);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, [animate, data]);

  // Filter visible data
  const visibleData = data.filter((_, i) => !hiddenSlices.has(i));
  const total = useMemo(() => visibleData.reduce((sum, d) => sum + (d[valueKey] || 0), 0), [visibleData, valueKey]);

  const isSemi = variant === 'semi';
  const isDonut = variant === 'donut';
  const isRose = variant === 'rose';
  const isExploded = variant === 'exploded';
  const isLegendSide = showLegend && (legendPosition === 'left' || legendPosition === 'right');

  // When legend is on the side, reduce the chart size to fit within the same total width
  // Reserve space for the legend (approximately 120px for the legend width)
  const legendSideWidth = isLegendSide ? 120 : 0;
  const effectiveWidth = isLegendSide ? Math.max(width - legendSideWidth, 100) : width;
  const effectiveHeight = isLegendSide ? Math.min(height, effectiveWidth) : height;

  const legendHeight = showLegend && (legendPosition === 'bottom' || legendPosition === 'top') ? 50 : 0;
  const centerX = effectiveWidth / 2;
  const centerY = isSemi ? effectiveHeight - 20 : (showLegend && legendPosition === 'bottom' ? (effectiveHeight - legendHeight) / 2 : effectiveHeight / 2);
  // Add extra padding (15px) to prevent hover scale effect from clipping
  const basePadding = isExploded ? 25 : 15;
  const baseRadius = Math.min(centerX, isSemi ? effectiveHeight - 40 : (showLegend && legendPosition === 'bottom' ? (effectiveHeight - legendHeight) / 2 : centerY)) - basePadding;
  const innerRadius = isDonut ? baseRadius - donutWidth : 0;

  // Get color shades
  const getSliceColor = (index) => {
    const palette = colorPalettes[color] || colorPalettes.violet;
    const step = Math.max(1, Math.floor(palette.length / data.length));
    const colorIndex = Math.min(index * step, palette.length - 1);
    return palette[colorIndex];
  };

  // Calculate slices (only visible ones)
  const slices = useMemo(() => {
    const totalAngle = isSemi ? Math.PI : 2 * Math.PI;
    const startAngle = isSemi ? -Math.PI : -Math.PI / 2;
    let currentAngle = startAngle;

    const maxValue = isRose ? Math.max(...visibleData.map(d => d[valueKey] || 0)) : 0;

    return data.map((item, i) => {
      if (hiddenSlices.has(i)) {
        return { item, value: 0, percentage: 0, hidden: true, color: getSliceColor(i), startAngle: currentAngle, endAngle: currentAngle, midAngle: currentAngle, radius: 0, offsetX: 0, offsetY: 0 };
      }

      const value = item[valueKey] || 0;
      const angle = total > 0 ? (value / total) * totalAngle * animationProgress : 0;
      const sliceStartAngle = currentAngle;
      const sliceEndAngle = currentAngle + angle;
      currentAngle = sliceEndAngle;

      const radius = isRose
        ? innerRadius + (baseRadius - innerRadius) * (maxValue > 0 ? value / maxValue : 0)
        : baseRadius;

      const midAngle = (sliceStartAngle + sliceEndAngle) / 2;
      const explodeOffset = isExploded ? 10 : 0;
      const offsetX = Math.cos(midAngle) * explodeOffset;
      const offsetY = Math.sin(midAngle) * explodeOffset;

      return {
        item,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
        startAngle: sliceStartAngle,
        endAngle: sliceEndAngle,
        midAngle,
        color: getSliceColor(i),
        radius,
        offsetX,
        offsetY,
        hidden: false,
      };
    });
  }, [data, valueKey, total, animationProgress, color, isSemi, isRose, isExploded, baseRadius, innerRadius, hiddenSlices]);

  // Generate arc path
  const describeArc = (startAngle, endAngle, outerR, innerR = 0, cx = centerX, cy = centerY) => {
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const x1 = cx + Math.cos(startAngle) * outerR;
    const y1 = cy + Math.sin(startAngle) * outerR;
    const x2 = cx + Math.cos(endAngle) * outerR;
    const y2 = cy + Math.sin(endAngle) * outerR;

    if (innerR > 0) {
      const x3 = cx + Math.cos(endAngle) * innerR;
      const y3 = cy + Math.sin(endAngle) * innerR;
      const x4 = cx + Math.cos(startAngle) * innerR;
      const y4 = cy + Math.sin(startAngle) * innerR;
      return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    }

    return `M ${cx} ${cy} L ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const handleMouseMove = (e, slice, index) => {
    if (!showTooltip) return;
    setHoveredIndex(index);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const content = tooltipFormatter
        ? tooltipFormatter(slice.item, slice.value, slice.percentage)
        : (
          <div className="text-slate-700 dark:text-slate-200">
            <div className="font-medium">{slice.item[nameKey]}</div>
            <div className="text-slate-500 dark:text-slate-400">
              {formatNumber(slice.value)} ({slice.percentage.toFixed(1)}%)
            </div>
          </div>
        );
      setTooltip({
        visible: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        content
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltip({ ...tooltip, visible: false });
  };

  // Legend toggle
  const handleLegendToggle = useCallback((index) => {
    if (!legendInteractive) return;
    setHiddenSlices(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, [legendInteractive]);

  // Render labels on slices
  const renderLabels = () => {
    if (!showLabels) return null;

    return slices.filter(s => !s.hidden).map((slice, i) => {
      const labelRadius = (baseRadius + innerRadius) / 2;
      const x = centerX + slice.offsetX + Math.cos(slice.midAngle) * labelRadius;
      const y = centerY + slice.offsetY + Math.sin(slice.midAngle) * labelRadius;

      if (slice.percentage < 5) return null;

      return (
        <text
          key={i}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[11px] font-medium fill-white pointer-events-none"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
        >
          {showPercentage ? `${slice.percentage.toFixed(0)}%` : formatNumber(slice.value, true)}
        </text>
      );
    });
  };

  // Render center content for donut
  const renderCenterContent = () => {
    if (!isDonut) return null;

    if (centerContent) {
      return (
        <foreignObject
          x={centerX - innerRadius + 10}
          y={centerY - innerRadius + 10}
          width={(innerRadius - 10) * 2}
          height={(innerRadius - 10) * 2}
        >
          <div className="w-full h-full flex items-center justify-center">
            {centerContent}
          </div>
        </foreignObject>
      );
    }

    return (
      <>
        <text
          x={centerX}
          y={centerY - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-2xl font-bold fill-slate-800 dark:fill-slate-200"
        >
          {formatNumber(total, true)}
        </text>
        <text
          x={centerX}
          y={centerY + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-slate-500 dark:fill-slate-400"
        >
          Total
        </text>
      </>
    );
  };

  // Generate legend items from original data (not filtered)
  const legendItems = data.map((item, i) => ({
    color: getSliceColor(i),
    label: `${item[nameKey]} (${hiddenSlices.has(i) ? '—' : (total > 0 ? ((item[valueKey] / total) * 100).toFixed(1) : 0)}%)`,
    inactive: hiddenSlices.has(i),
  }));

  return (
    <div
      ref={containerRef}
      className={`relative ${isLegendSide && showLegend ? 'flex items-center justify-center' : 'flex flex-col items-center'} ${className}`}
      {...props}
    >
      {showLegend && legendPosition === 'top' && (
        <ChartLegend items={legendItems} position="top" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} />
      )}
      {showLegend && legendPosition === 'left' && (
        <ChartLegend items={legendItems} position="left" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} layout="vertical" />
      )}
      <div className="relative flex-shrink-0">
        <svg ref={ref} width={effectiveWidth} height={effectiveHeight} className="overflow-hidden">
          {slices.filter(s => !s.hidden).map((slice, i) => {
            const originalIndex = data.indexOf(slice.item);
            const isHovered = hoveredIndex === originalIndex;
            const scale = isHovered ? 1.05 : 1;
            const outerR = (isRose ? slice.radius : baseRadius) * scale;
            const innerR = (isDonut || isRose) ? innerRadius * scale : 0;
            const cx = centerX + slice.offsetX;
            const cy = centerY + slice.offsetY;

            return (
              <path
                key={originalIndex}
                d={describeArc(slice.startAngle, slice.endAngle, outerR, innerR, cx, cy)}
                fill={slice.color}
                className="cursor-pointer transition-all duration-200"
                style={{
                  filter: isHovered ? 'brightness(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.15))' : 'none'
                }}
                onMouseMove={(e) => handleMouseMove(e, slice, originalIndex)}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}

          {renderLabels()}
          {renderCenterContent()}
        </svg>
      </div>
      {showLegend && legendPosition === 'right' && (
        <ChartLegend items={legendItems} position="right" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} layout="vertical" />
      )}
      {showLegend && (legendPosition === 'bottom' || !legendPosition) && (
        <ChartLegend items={legendItems} position="bottom" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} />
      )}

      <ChartTooltip {...tooltip} theme={theme} chartRef={containerRef} />
    </div>
  );
});

PieChart.displayName = 'PieChart';

PieChart.propTypes = {
  data: PropTypes.array,
  valueKey: PropTypes.string,
  nameKey: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'donut', 'semi', 'rose', 'exploded']),
  color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'slate']),
  theme: PropTypes.oneOf(['default', 'glass', 'dark']),
  showLabels: PropTypes.bool,
  showPercentage: PropTypes.bool,
  animate: PropTypes.bool,
  donutWidth: PropTypes.number,
  centerContent: PropTypes.node,
  width: PropTypes.number,
  height: PropTypes.number,
  showTooltip: PropTypes.bool,
  tooltipFormatter: PropTypes.func,
  showLegend: PropTypes.bool,
  legendPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  legendAlign: PropTypes.oneOf(['start', 'center', 'end']),
  legendShape: PropTypes.oneOf(['circle', 'square', 'line', 'dashed', 'diamond']),
  legendInteractive: PropTypes.bool,
  className: PropTypes.string,
};

export default PieChart;

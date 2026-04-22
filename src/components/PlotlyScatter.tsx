import React, { useRef, useEffect, useState } from 'react';
import Plot, { PlotParams } from 'react-plotly.js';
import { LayoutAxis } from 'plotly.js';
import { cn } from '@/lib/utils';

export type PlotlyScatterProps = {
  /** Plotly trace array to render. Defaults to a sample line+marker dataset. */
  data: PlotParams['data'];
  /** Plot title displayed above the chart. */
  title?: string;
  /** Label for the x axis. Increases bottom margin when set. */
  xAxisTitle?: string;
  /** Label for the y axis. Increases left margin when set. */
  yAxisTitle?: string;
  /** Fixed [min, max] range for the x axis. When omitted Plotly auto-scales. */
  xAxisRange?: [number, number];
  /** Fixed [min, max] range for the y axis. When omitted Plotly auto-scales. */
  yAxisRange?: [number, number];
  /** Additional Plotly xaxis layout overrides merged on top of defaults. */
  xAxisLayout?: Partial<LayoutAxis>;
  /** Additional Plotly yaxis layout overrides merged on top of defaults. */
  yAxisLayout?: Partial<LayoutAxis>;
  /** Background color for the plot area. */
  plotBgColor?: string;
  /** Background color for the entire plot paper/canvas. */
  paperBgColor?: string;
  /** Color of the grid lines. */
  gridColor?: string;
  /** Color of the zero lines (if they exist). */
  zeroLineColor?: string;
  /** Color of the tick labels on axes. */
  tickLabelColor?: string;
  /** Color of the axis titles. */
  axisTitleColor?: string;
  /** Color of the plot title. */
  plotTitleColor?: string;
  /** Additional CSS classes applied to the root container div. */
  className?: string;
};

const sampleData: PlotParams['data'] = [
  {
    x: [1, 2, 3],
    y: [2, 6, 3],
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: 'red' },
  },
];

const titleFont = {
  size: 16,
  color: '#082f49'
}

const PlotlyScatter = React.memo(function PlotlyScatter({
  data = sampleData,
  title,
  xAxisTitle,
  yAxisTitle,
  xAxisRange,
  yAxisRange,
  xAxisLayout,
  yAxisLayout,
  plotBgColor,
  paperBgColor,
  gridColor,
  zeroLineColor,
  tickLabelColor,
  axisTitleColor,
  plotTitleColor,
  className,
  ...props
}: PlotlyScatterProps) {
  const plotContainer = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Hook to update dimensions dynamically
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });
    if (plotContainer.current) {
      resizeObserver.observe(plotContainer.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className={cn('max-h-full h-96 rounded-lg overflow-hidden', className)} ref={plotContainer} {...props}>
      <Plot
        data={data}
        layout={{
          title: {
            text: title,
            font: { 
              size: 16,
              color: plotTitleColor || '#082f49'
            }
          },
          plot_bgcolor: plotBgColor || '#E2E8F0',
          paper_bgcolor: paperBgColor || '#E2E8F0',
          xaxis: { 
            title: {
              text: xAxisTitle,
              font: {
                size: 16,
                color: axisTitleColor || '#082f49'
              }
            },
            gridcolor: gridColor || '#d1d5db',
            zerolinecolor: zeroLineColor || '#6b7280',
            tickfont: { color: tickLabelColor || '#6b7280' },
            range: xAxisRange ? xAxisRange : undefined,
            ...xAxisLayout,
          },
          yaxis: { 
            title: {
              text: yAxisTitle,
              font: {
                size: 16,
                color: axisTitleColor || '#082f49'
              }
            },
            gridcolor: gridColor || '#d1d5db',
            zerolinecolor: zeroLineColor || '#6b7280',
            tickfont: { color: tickLabelColor || '#6b7280' },
            range: yAxisRange ? yAxisRange : undefined, 
            ...yAxisLayout,
          },
          autosize: true,
          width: dimensions.width,
          height: dimensions.height,
          margin: {
            l: yAxisTitle ? 60 : 50,
            r: 30,
            t: 30,
            b: xAxisTitle ? 70 : 30,
          },
        }}
        config={{ responsive: true }}
      />
    </div>
  );
});

export default PlotlyScatter;
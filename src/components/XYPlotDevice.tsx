import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PlotlyScatter from './PlotlyScatter';
import { PlotlyScatterData } from '@/types/plotTypes';
import { Datum } from 'plotly.js';
import { cn } from '@/lib/utils';

type DeviceLike = {
    value: string | number | boolean;
    units?: string;
    connected?: boolean;
};

export interface XYPlotDeviceProps {
    /** Pre-connected device object for X-axis. When null/undefined the plot waits for data. */
    xDevice: DeviceLike | null | undefined;
    /** Pre-connected device object for Y-axis. When null/undefined the plot waits for data. */
    yDevice: DeviceLike | null | undefined;
    /** Label shown on the x-axis */
    xAxisLabel?: string;
    /** Label shown on the y-axis */
    yAxisLabel?: string;
    /** Additional CSS classes applied to the root container. */
    className?: string;
    /** Maximum number of data points shown at once before the oldest are dropped. Defaults to 100. */
    maxDataPoints?: number;
    /** CSS color string for the scatter trace markers. Defaults to '#1f77b4'. */
    color?: string;
    /** Size of the scatter plot markers. Defaults to 6. */
    markerSize?: number;
    /** When true, stops adding new data points but keeps existing plot visible. Defaults to false. */
    paused?: boolean;
}

export default function XYPlotDevice({
    xDevice,
    yDevice,
    xAxisLabel = 'X Axis',
    yAxisLabel = 'Y Axis',
    className = '',
    maxDataPoints = 100,
    color = '#1f77b4',
    markerSize = 6,
    paused = false
}: XYPlotDeviceProps) {
    const [dataPoints, setDataPoints] = useState<{ x: number; y: number }[]>([]);
    const prevXValueRef = useRef<number | undefined>(undefined);
    const prevYValueRef = useRef<number | undefined>(undefined);

    // Add new data point when either device value changes (only if not paused)
    useEffect(() => {
        // Don't add new points if paused
        if (paused) return;
        
        const xValue = typeof xDevice?.value === 'number' ? xDevice.value : undefined;
        const yValue = typeof yDevice?.value === 'number' ? yDevice.value : undefined;
        
        // Only add point if both devices are connected and have valid numeric values
        const xConnected = xDevice?.connected !== false; // treat undefined as true for backward compatibility
        const yConnected = yDevice?.connected !== false;
        
        if (xConnected && yConnected && 
            typeof xValue === 'number' && typeof yValue === 'number' &&
            (xValue !== prevXValueRef.current || yValue !== prevYValueRef.current)) {
            
            setDataPoints(prev => {
                const newPoints = [...prev, { x: xValue, y: yValue }];
                // Limit to maxDataPoints to prevent memory issues
                return newPoints.slice(-maxDataPoints);
            });
            
            prevXValueRef.current = xValue;
            prevYValueRef.current = yValue;
        }
    }, [xDevice?.value, yDevice?.value, xDevice?.connected, yDevice?.connected, maxDataPoints, paused]);

    // Generate plot data
    const plotData: PlotlyScatterData = useMemo(() => {
        const x: Datum[] = dataPoints.map(point => point.x);
        const y: Datum[] = dataPoints.map(point => point.y);
        
        return {
            x,
            y,
            mode: 'markers',
            type: 'scatter',
            marker: { 
                color: color,
                size: markerSize
            },
            name: 'XY Data'
        };
    }, [dataPoints, color, markerSize]);

    // Generate axis labels with units if available
    const xLabel = useMemo(() => {
        const units = xDevice?.units;
        return units ? `${xAxisLabel} (${units})` : xAxisLabel;
    }, [xAxisLabel, xDevice?.units]);

    const yLabel = useMemo(() => {
        const units = yDevice?.units;
        return units ? `${yAxisLabel} (${units})` : yAxisLabel;
    }, [yAxisLabel, yDevice?.units]);

    // Clear data points when devices disconnect or change
    const clearData = useCallback(() => {
        setDataPoints([]);
        prevXValueRef.current = undefined;
        prevYValueRef.current = undefined;
    }, []);

    // Show status message if devices aren't ready
    const bothDevicesConnected = (xDevice?.connected !== false) && (yDevice?.connected !== false);
    const bothDevicesHaveNumericValues = typeof xDevice?.value === 'number' && typeof yDevice?.value === 'number';

    if (!bothDevicesConnected || !bothDevicesHaveNumericValues) {
        return (
            <div className={cn(`${bothDevicesConnected ? 'bg-gray-50' : 'bg-transparent'} h-full flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-800`, className)}>
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">XY Plot</p>
                    <p className="text-xs text-gray-500">
                        {!bothDevicesConnected ? 'Waiting for device connections...' : 'Waiting for numeric values...'}
                    </p>
                    {dataPoints.length > 0 && (
                        <button 
                            onClick={clearData}
                            className="mt-2 px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                        >
                            Clear Data
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={cn("h-full text-gray-800", className)}>
            <div className="h-full relative">
                <PlotlyScatter
                    data={[plotData]}
                    xAxisTitle={xLabel}
                    yAxisTitle={yLabel}
                    className="h-full w-full "
                    plotBgColor="#142E48"
                    paperBgColor="#142E48"
                    axisTitleColor='#E2E8F0'
                />
                
                {/* Data point counter and clear button */}
                <div className="absolute top-2 right-2 flex items-center gap-2">
                    <span className={cn(
                        "text-xs px-2 py-1 rounded shadow",
                        paused ? "bg-orange-100 text-orange-800" : "bg-white/80"
                    )}>
                        {dataPoints.length} points {paused && "(paused)"}
                    </span>
                    {dataPoints.length > 0 && (
                        <button 
                            onClick={clearData}
                            className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
import React, { useState } from 'react';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import SignalMonitorPlotDevice from '@/components/SignalMonitorPlotDevice';
import XYPlotDevice from '@/components/XYPlotDevice';
import { cn } from '@/lib/utils';

export interface StripchartProps {
    /** Array of motor PV names for selection */
    motorPVs: string[];
    /** Array of signal PV names for selection */
    signalPVs: string[];
    /** Additional CSS classes for the container */
    className?: string;
}

export default function Stripchart({ motorPVs, signalPVs, className = '' }: StripchartProps) {
    const [selectedMotor, setSelectedMotor] = useState<string>(motorPVs[0] || '');
    const [selectedSignal, setSelectedSignal] = useState<string>(signalPVs[0] || '');
    const [stepSize, setStepSize] = useState<number>(1.0);
    const [plotsEnabled, setPlotsEnabled] = useState<boolean>(true);
    const [plotKey, setPlotKey] = useState<number>(0);

    // Generate RBV PV names for plotting
    const getPlottingPV = (pvName: string) => {
        return pvName.endsWith('.RBV') ? pvName : `${pvName}.RBV`;
    };

    const selectedMotorRBV = getPlottingPV(selectedMotor);
    const selectedSignalRBV = getPlottingPV(selectedSignal);

    // Get live device data for selected PVs and their RBV counterparts
    const allPVs = [selectedMotor, selectedSignal, selectedMotorRBV, selectedSignalRBV].filter(Boolean);
    const { devices, handleSetValueRequest } = useOphydPVSocket(allPVs);
    
    const motorDevice = devices[selectedMotor];
    const signalDevice = devices[selectedSignal];
    const motorRBVDevice = devices[selectedMotorRBV];
    const signalRBVDevice = devices[selectedSignalRBV];
    
    const motorValue = motorDevice?.connected && motorDevice?.value !== undefined ? motorDevice.value : 'N/C';
    const signalValue = signalRBVDevice?.connected && signalRBVDevice?.value !== undefined ? signalRBVDevice.value : 'N/C';

    const handleStepUp = () => {
        if (motorDevice?.connected && typeof motorDevice.value === 'number') {
            const newValue = motorDevice.value + stepSize;
            handleSetValueRequest(selectedMotor, newValue);
            console.log(`Setting ${selectedMotor} to ${newValue}`);
        }
    };

    const handleStepDown = () => {
        if (motorDevice?.connected && typeof motorDevice.value === 'number') {
            const newValue = motorDevice.value - stepSize;
            handleSetValueRequest(selectedMotor, newValue);
            console.log(`Setting ${selectedMotor} to ${newValue}`);
        }
    };

    const handleClearPlots = () => {
        // Reset both plots by incrementing the key (forces remount)
        setPlotKey(prev => prev + 1);
        setPlotsEnabled(true);
    };

    const handleTogglePlots = () => {
        setPlotsEnabled(prev => !prev);
    };

    return (
        <div className={cn("h-full p-4 space-y-4 overflow-auto text-gray-800", className)}>
            {/* Top Row - Motor and Signal Selection */}
            <div className="grid grid-cols-2 gap-6">
                {/* Motor Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 min-w-fit">Motor:</label>
                        <select
                            value={selectedMotor}
                            onChange={(e) => setSelectedMotor(e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {motorPVs.map((pv) => (
                                <option key={pv} value={pv}>
                                    {pv}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 min-w-fit">Set Position:</span>
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded border flex-1">
                            {typeof motorValue === 'number' ? motorValue.toFixed(3) : motorValue}
                            {motorDevice?.units && typeof motorValue === 'number' && (
                                <span className="text-xs ml-1">{motorDevice.units}</span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Signal Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 min-w-fit">Signal:</label>
                        <select
                            value={selectedSignal}
                            onChange={(e) => setSelectedSignal(e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {signalPVs.map((pv) => (
                                <option key={pv} value={pv}>
                                    {pv}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 min-w-fit">RBV:</span>
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded border flex-1">
                            {typeof signalValue === 'number' ? signalValue.toFixed(3) : signalValue}
                            {signalRBVDevice?.units && typeof signalValue === 'number' && (
                                <span className="text-xs ml-1">{signalRBVDevice.units}</span>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* Motor Control Row */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <label className="text-sm font-medium text-gray-700">Step Size:</label>
                <input
                    type="number"
                    value={stepSize}
                    onChange={(e) => setStepSize(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    className="w-24 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleStepUp}
                    disabled={!motorDevice?.connected}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition-colors"
                >
                    Step Up
                </button>
                <button
                    onClick={handleStepDown}
                    disabled={!motorDevice?.connected}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition-colors"
                >
                    Step Down
                </button>
                
                {/* Divider */}
                <div className="h-8 w-px bg-gray-300"></div>
                
                {/* Plot Control Buttons */}
                <button
                    onClick={handleClearPlots}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                    Clear
                </button>
                <button
                    onClick={handleTogglePlots}
                    className={cn(
                        "px-4 py-2 text-white text-sm font-medium rounded-md transition-colors",
                        plotsEnabled 
                            ? "bg-orange-600 hover:bg-orange-700" 
                            : "bg-gray-600 hover:bg-gray-700"
                    )}
                >
                    {plotsEnabled ? 'Done' : 'Resume'}
                </button>
            </div>

            {/* Live Signal Plot */}
            <div className="flex-1 min-h-[300px] bg-white border border-gray-200 rounded-lg p-4">
                {selectedSignal && signalRBVDevice ? (
                    <div className="h-full relative">
                        <SignalMonitorPlotDevice 
                            key={`signal-${plotKey}`}
                            device={plotsEnabled ? signalRBVDevice : null}
                            deviceLabel={selectedSignalRBV}
                            className="h-full"
                        />
                        {!plotsEnabled && (
                            <div className="absolute top-2 right-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded shadow">
                                (paused)
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        <p>
                            {!selectedSignal 
                                ? 'Select a signal to start plotting'
                                : 'Waiting for signal connection...'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* XY Plot - Motor Position vs Signal */}
            <div className="h-[300px] bg-white border border-gray-200 rounded-lg p-4">
                <XYPlotDevice
                    key={`xy-${plotKey}`}
                    xDevice={motorRBVDevice}
                    yDevice={signalRBVDevice}
                    xAxisLabel="Motor Position"
                    yAxisLabel="Signal"
                    paused={!plotsEnabled}
                    className="h-full"
                />
            </div>
        </div>
    );
}
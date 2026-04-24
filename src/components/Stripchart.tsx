import React, { useState } from 'react';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import SignalMonitorPlotDevice from '@/components/SignalMonitorPlotDevice';
import XYPlotDevice from '@/components/XYPlotDevice';
import { Eraser, StopCircle, PlayCircle, PersonSimpleRun, BookOpenText, Ruler, ArrowFatLineUp, ArrowFatLineDown } from '@phosphor-icons/react';
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

    // Default input styling to match Scan component
    const inputStyles = "p-1 border border-gray-300 bg-sky-800 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100";

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
        <div className={cn("h-full p-4 space-y-4 overflow-auto text-gray-800 bg-sky-950", className)}>
            {/* Main Controls Layout */}
            <div className="flex flex-wrap gap-8 items-center justify-center w-fit m-auto pb-8">
                {/* Motor, Signal, and Step Size Form */}
                <div className="space-y-3 flex-shrink-0 m-auto">
                    {/* Row 1: Motor Selection */}
                    <div className="flex items-center gap-2">
                        <PersonSimpleRun size={20} className="text-white" />
                        <label className="text-sm font-medium text-white min-w-20">Motor:</label>
                        <select
                            value={selectedMotor}
                            onChange={(e) => setSelectedMotor(e.target.value)}
                            className={cn("w-48", inputStyles)}
                        >
                            {motorPVs.map((pv) => (
                                <option key={pv} value={pv}>
                                    {pv}
                                </option>
                            ))}
                        </select>
                        <span className="text-xs font-mono text-gray-300 ml-2 min-w-24">
                            {typeof motorValue === 'number' ? motorValue.toFixed(3) : motorValue}
                            {motorDevice?.units && typeof motorValue === 'number' && (
                                <span className="text-xs ml-1">{motorDevice.units}</span>
                            )}
                        </span>
                    </div>

                    {/* Row 2: Signal Selection */}
                    <div className="flex items-center gap-2">
                        <BookOpenText size={20} className="text-white" />
                        <label className="text-sm font-medium text-white min-w-20">Signal:</label>
                        <select
                            value={selectedSignal}
                            onChange={(e) => setSelectedSignal(e.target.value)}
                            className={cn("w-48", inputStyles)}
                        >
                            {signalPVs.map((pv) => (
                                <option key={pv} value={pv}>
                                    {pv}
                                </option>
                            ))}
                        </select>
                        <span className="text-xs font-mono text-gray-300 ml-2 min-w-24">
                            {typeof signalValue === 'number' ? signalValue.toFixed(3) : signalValue}
                            {signalRBVDevice?.units && typeof signalValue === 'number' && (
                                <span className="text-xs ml-1">{signalRBVDevice.units}</span>
                            )}
                        </span>
                    </div>

                    {/* Row 3: Step Size */}
                    <div className="flex items-center gap-2">
                        <Ruler size={20} className="text-white" />
                        <label className="text-sm font-medium text-white min-w-20">Step Size:</label>
                        <input
                            type="number"
                            value={stepSize}
                            onChange={(e) => setStepSize(parseFloat(e.target.value) || 0)}
                            step="0.1"
                            className={cn("w-24", inputStyles)}
                        />
                    </div>
                </div>

                {/* Button Controls */}
                <div className="flex flex-wrap gap-4 m-auto p-4 rounded-md border border-slate- bg-slate-300">
                    {/* Motor Control Buttons */}
                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={handleStepDown}
                                disabled={!motorDevice?.connected}
                                className="p-3 bg-sky-600 hover:bg-slate-400 disabled:bg-gray-400 rounded-md transition-colors flex items-center justify-center shadow-lg"
                            >
                                <ArrowFatLineDown size={36} className="text-white" />
                            </button>
                            <span className="text-xs text-slate-800 font-extralight">step down</span>
                        </div>
                        
                        {/* Motor Readback Display */}
                        <div className="flex flex-col items-center justify-center px-4 py-0 min-w-32">
                            <div className="text-sm text-sky-800 text-center mb-1 font-semibold">{selectedMotor}</div>
                            <div className="text-2xl text-black font-medium text-center py-1">
                                {typeof motorValue === 'number' ? motorValue.toFixed(3) : 'N/C'}
                            </div>
                            <div className="text-xs text-slate-800 text-center mt-0 font-extralight">readback</div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={handleStepUp}
                                disabled={!motorDevice?.connected}
                                className="p-3 bg-sky-600 hover:bg-slate-400 disabled:bg-gray-400 rounded-md transition-colors flex items-center justify-center shadow-lg"
                            >
                                <ArrowFatLineUp size={36} className="text-white" />
                            </button>
                            <span className="text-xs text-slate-800 font-extralight">step up</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Signal Plot */}
            <div className="flex-1 min-h-[300px] border border-gray-200 rounded-lg p-4">
                {selectedSignal && signalRBVDevice ? (
                    <div className="h-full relative">
                        <SignalMonitorPlotDevice 
                            key={`signal-${plotKey}`}
                            device={plotsEnabled ? signalRBVDevice : null}
                            deviceLabel={selectedSignalRBV}
                            className="h-full"
                            plotBgColor="#142E48"
                            paperBgColor="#142E48"
                            color="#F88626"
                            axisTitleColor='#E2E8F0'
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
            {/* Plot Control Buttons */}
            <div className="flex items-center gap-2 justify-center w-full space-x-8">
                <button
                    onClick={handleClearPlots}
                    title="Clear data from plots"
                    className="px-4 py-2 border border-gray-300 text-gray-300 text-sm font-medium rounded-md hover:text-white transition-colors flex items-center gap-2"
                >
                    <Eraser size={24} />
                    Clear
                </button>
                <button
                    onClick={handleTogglePlots}
                    title="Stop/resume the plots from receiving new data points"
                    className="px-4 py-2 border border-gray-300 text-gray-300 text-sm font-medium rounded-md hover:text-white transition-colors flex items-center gap-2"
                >
                    {plotsEnabled ? <StopCircle size={24} /> : <PlayCircle size={24} />}
                    {plotsEnabled ? 'Stop' : 'Resume'}
                </button>
            </div>
            {/* XY Plot - Motor Position vs Signal */}
            <div className="h-[400px] border border-gray-200 rounded-lg p-4">
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
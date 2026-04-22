import React, { useState, useMemo } from 'react';
import useOphydDeviceSocket from '@/api/ophyd/useOphydDeviceSocket';
import { useDevicesAllowedQuery } from '@/api/qServer/hooks';
import XYPlotDevice from '@/components/XYPlotDevice';
import QSConsole from './QServer/QSConsole';
import ExperimentExecutePlanButtonGeneric from '@/components/Experiment/ExperimentExecutePlanButtonGeneric';
import { Eraser, StopCircle, PersonSimpleRun, BookOpenText, BracketsCurly, Steps, PlayCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export interface ScanProps {
    /** Array of motor device names for selection (optional - will query server if not provided) */
    motorOphydNames?: string[];
    /** Array of signal device names for selection (optional - will query server if not provided) */
    signalOphydNames?: string[];
    /** Additional CSS classes for the container */
    className?: string;
    /** CSS classes to apply to all input boxes and selectors */
    inputClassName?: string;
}

export default function Scan({ motorOphydNames, signalOphydNames, className = '', inputClassName = '' }: ScanProps) {
    const [selectedMotor, setSelectedMotor] = useState<string>('');
    const [selectedSignal, setSelectedSignal] = useState<string>('');
    const [scanStart, setScanStart] = useState<number>(0);
    const [scanStop, setScanStop] = useState<number>(10);
    const [scanStep, setScanStep] = useState<number>(1);
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [plotsEnabled, setPlotsEnabled] = useState<boolean>(true);
    const [plotKey, setPlotKey] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Default input styling that can be overridden via props
    const defaultInputStyles = "p-1 border border-gray-300 bg-sky-800 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100";
    const inputStyles = cn(defaultInputStyles, inputClassName);

    // Get devices from Queue Server if not provided via props
    const { data: devicesData, isLoading: devicesLoading, error: devicesError } = useDevicesAllowedQuery({
        enabled: !motorOphydNames || !signalOphydNames
    });

    // Determine available devices
    const availableDevices = useMemo(() => {
        if (motorOphydNames && signalOphydNames) {
            return {
                motors: motorOphydNames,
                signals: signalOphydNames
            };
        }

        if (devicesData?.devices_allowed) {
            const deviceNames = Object.keys(devicesData.devices_allowed);
            // For now, treat all devices as both motors and signals
            // In a real implementation, you might want to filter by device type
            return {
                motors: deviceNames,
                signals: deviceNames
            };
        }

        return { motors: [], signals: [] };
    }, [motorOphydNames, signalOphydNames, devicesData]);

    // Set default selections when devices become available
    React.useEffect(() => {
        if (availableDevices.motors.length > 0 && !selectedMotor) {
            setSelectedMotor(availableDevices.motors[0]);
        }
        if (availableDevices.signals.length > 0 && !selectedSignal) {
            setSelectedSignal(availableDevices.signals[0]);
        }
    }, [availableDevices, selectedMotor, selectedSignal]);

    // Connect to selected devices
    const deviceList = [selectedMotor, selectedSignal].filter(Boolean);
    const { devices } = useOphydDeviceSocket(deviceList);

    const motorDevice = devices[selectedMotor];
    const signalDevice = devices[selectedSignal];

    // Calculate number of steps for the scan
    const numSteps = useMemo(() => {
        if (scanStep <= 0) return 1;
        return Math.ceil(Math.abs(scanStop - scanStart) / scanStep) + 1;
    }, [scanStart, scanStop, scanStep]);

    // Prepare kwargs for the scan plan
    const scanKwargs = useMemo(() => {
        return {
            detectors: [selectedSignal],
            motor: selectedMotor,
            start: scanStart,
            stop: scanStop,
            num: numSteps,
            md: {}
        };
    }, [selectedSignal, selectedMotor, scanStart, scanStop, numSteps]);

    const handleScanSuccess = (response: any) => {
        console.log('Scan plan executed successfully:', response);
        setIsScanning(true);
        setErrorMessage(''); // Clear any previous errors
        // The scan will run on the queue server, we can monitor its progress
        // For now, just reset scanning state after a delay
        setTimeout(() => setIsScanning(false), 5000);
    };

    const handleScanError = (error: string) => {
        console.error('Scan plan execution failed:', error);
        setIsScanning(false);
        setErrorMessage(error);
        // Clear error message after 10 seconds
        setTimeout(() => setErrorMessage(''), 10000);
    };

    const handleClearPlots = () => {
        setPlotKey(prev => prev + 1);
        setPlotsEnabled(true);
    };

    const handleTogglePlots = () => {
        setPlotsEnabled(prev => !prev);
    };

    if (devicesLoading) {
        return (
            <div className={cn("h-full flex items-center justify-center text-gray-800", className)}>
                <p>Loading available devices...</p>
            </div>
        );
    }

    if (devicesError) {
        return (
            <div className={cn("h-full flex items-center justify-center text-gray-800", className)}>
                <p className="text-red-600">Error loading devices: {devicesError.message}</p>
            </div>
        );
    }

    return (
        <div className={cn("h-full p-4 space-y-4 overflow-auto text-gray-800 bg-sky-950", className)}>
            <div className="flex flex-wrap gap-4 items-center justify-center">
                <div className="flex flex-col min-w-fit w-fit flex-shrink-0">
                    {/* Scan Configuration - Four Row Structure with Icons */}
                    <div className="space-y-3">
                        {/* Row 1: Motor Selection */}
                        <div className="flex items-center gap-2">
                            <PersonSimpleRun size={20} className="text-white" />
                            <label className="text-sm font-medium text-white min-w-20">Run Motor:</label>
                            <select
                                value={selectedMotor}
                                onChange={(e) => setSelectedMotor(e.target.value)}
                                disabled={isScanning}
                                className={cn("w-48", inputStyles)}
                            >
                                <option value="">Select Motor</option>
                                {availableDevices.motors.map((device) => (
                                    <option key={device} value={device}>
                                        {device}
                                    </option>
                                ))}
                            </select>
                            <span className="text-xs font-mono text-gray-300 ml-2">
                                {motorDevice?.connected && typeof motorDevice.value === 'number' 
                                    ? motorDevice.value.toFixed(3) 
                                    : 'N/C'
                                }
                                {motorDevice?.units && typeof motorDevice.value === 'number' && (
                                    <span className="text-xs ml-1">{motorDevice.units}</span>
                                )}
                            </span>
                        </div>

                        {/* Row 2: Signal Selection */}
                        <div className="flex items-center gap-2">
                            <BookOpenText size={20} className="text-white" />
                            <label className="text-sm font-medium text-white min-w-20">Read Signal:</label>
                            <select
                                value={selectedSignal}
                                onChange={(e) => setSelectedSignal(e.target.value)}
                                disabled={isScanning}
                                className={cn("w-48", inputStyles)}
                            >
                                <option value="">Select Signal</option>
                                {availableDevices.signals.map((device) => (
                                    <option key={device} value={device}>
                                        {device}
                                    </option>
                                ))}
                            </select>
                            <span className="text-xs font-mono text-gray-300 ml-2">
                                {signalDevice?.connected && typeof signalDevice.value === 'number' 
                                    ? signalDevice.value.toFixed(3) 
                                    : 'N/C'
                                }
                                {signalDevice?.units && typeof signalDevice.value === 'number' && (
                                    <span className="text-xs ml-1">{signalDevice.units}</span>
                                )}
                            </span>
                        </div>

                        {/* Row 3: Range Parameters */}
                        <div className="flex items-center gap-2">
                            <BracketsCurly size={20} className="text-white" />
                            <label className="text-sm font-medium text-white min-w-20">Range:</label>
                            <input
                                type="number"
                                value={scanStart}
                                onChange={(e) => setScanStart(parseFloat(e.target.value) || 0)}
                                disabled={isScanning}
                                className={cn("w-24", inputStyles)}
                            />
                            <span className="text-white text-sm mx-2">to</span>
                            <input
                                type="number"
                                value={scanStop}
                                onChange={(e) => setScanStop(parseFloat(e.target.value) || 0)}
                                disabled={isScanning}
                                className={cn("w-24", inputStyles)}
                            />
                        </div>

                        {/* Row 4: Step Parameter */}
                        <div className="flex items-center gap-2">
                            <Steps size={20} className="text-white" />
                            <label className="text-sm font-medium text-white min-w-20">Step Size:</label>
                            <input
                                type="number"
                                value={scanStep}
                                onChange={(e) => setScanStep(parseFloat(e.target.value) || 0.1)}
                                step="0.1"
                                disabled={isScanning}
                                className={cn("w-24", inputStyles)}
                            />
                            <div className="text-sm text-gray-300 ml-2">
                                {numSteps > 1 && (
                                    <span>({numSteps} steps total)</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Centered Execute Button */}
                    <div className="flex justify-center p-1 pt-8">
                        <ExperimentExecutePlanButtonGeneric
                            planName="scan"
                            kwargs={scanKwargs}
                            disabled={!selectedMotor || !selectedSignal || !motorDevice?.connected || !signalDevice?.connected || scanStep <= 0}
                            className="px-6 py-2 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition-colors"
                            onSuccess={handleScanSuccess}
                            onError={handleScanError}
                        />
                    </div>

                    {/* Error Message Display */}
                    {errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-red-600 text-sm">⚠️ Scan Error:</span>
                                    <span className="text-red-700 text-sm">{errorMessage}</span>
                                </div>
                                <button
                                    onClick={() => setErrorMessage('')}
                                    className="text-red-500 hover:text-red-700 text-sm px-2"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-52 flex-grow min-w-96">
                    <QSConsole 
                        processConsoleMessage={()=>{}} 
                        classNameTextRow="text-xs" 
                        hideTimestamp={true} 
                        darkMode={true}
                        classNameMessageText='text-slate-400'
                        classNameMainBg='bg-sky-950 border border-gray-700'
                />
                </div>
            </div>


            {/* Motor vs Signal XY Plot */}
            <div className="h-96 rounded-lg p-4">
                {selectedMotor && selectedSignal && motorDevice && signalDevice ? (
                    <XYPlotDevice
                        key={`scan-xy-${plotKey}`}
                        xDevice={motorDevice}
                        yDevice={signalDevice}
                        xAxisLabel="Motor Position"
                        yAxisLabel="Signal"
                        paused={!plotsEnabled}
                        className="h-full"
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        <p>
                            {!selectedMotor || !selectedSignal 
                                ? 'Select motor and signal to start plotting'
                                : 'Waiting for device connections...'
                            }
                        </p>
                    </div>
                )}
            </div>
            
            {/* Plot Control Buttons - Below Plot */}
            <div className="flex justify-center items-center gap-16">
                <button
                    onClick={handleClearPlots}
                    title="Clear data from plot"
                    className="px-4 py-2 border border-gray-300 text-gray-300 text-sm font-medium rounded-md hover:text-white transition-colors flex items-center gap-2"
                >
                    <Eraser size={24} />
                    Clear
                </button>
                <button
                    onClick={handleTogglePlots}
                    title="Stop/resume the plot from receiving new data points"
                    className="px-4 py-2 border border-gray-300 text-gray-300 text-sm font-medium rounded-md hover:text-white transition-colors flex items-center gap-2"
                >
                    {plotsEnabled ? <StopCircle size={24} /> : <PlayCircle size={24} />}
                    {plotsEnabled ? 'Stop' : 'Resume'}
                </button>
            </div>
        </div>
    );
}
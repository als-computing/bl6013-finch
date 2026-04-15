import React, { useState, useMemo } from 'react';
import useOphydDeviceSocket from '@/api/ophyd/useOphydDeviceSocket';
import { useDevicesAllowedQuery } from '@/api/qServer/hooks';
import XYPlotDevice from '@/components/XYPlotDevice';
import ExperimentExecutePlanButtonGeneric from '@/components/Experiment/ExperimentExecutePlanButtonGeneric';
import { cn } from '@/lib/utils';

export interface ScanProps {
    /** Array of motor device names for selection (optional - will query server if not provided) */
    motorOphydNames?: string[];
    /** Array of signal device names for selection (optional - will query server if not provided) */
    signalOphydNames?: string[];
    /** Additional CSS classes for the container */
    className?: string;
}

export default function Scan({ motorOphydNames, signalOphydNames, className = '' }: ScanProps) {
    const [selectedMotor, setSelectedMotor] = useState<string>('');
    const [selectedSignal, setSelectedSignal] = useState<string>('');
    const [scanStart, setScanStart] = useState<number>(0);
    const [scanStop, setScanStop] = useState<number>(10);
    const [scanStep, setScanStep] = useState<number>(1);
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [plotsEnabled, setPlotsEnabled] = useState<boolean>(true);
    const [plotKey, setPlotKey] = useState<number>(0);

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
        // The scan will run on the queue server, we can monitor its progress
        // For now, just reset scanning state after a delay
        setTimeout(() => setIsScanning(false), 5000);
    };

    const handleScanError = (error: string) => {
        console.error('Scan plan execution failed:', error);
        setIsScanning(false);
        // You might want to show this error in the UI
        alert(`Scan failed: ${error}`);
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
                            disabled={isScanning}
                            className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">Select Motor</option>
                            {availableDevices.motors.map((device) => (
                                <option key={device} value={device}>
                                    {device}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 min-w-fit">Position:</span>
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded border flex-1">
                            {motorDevice?.connected && typeof motorDevice.value === 'number' 
                                ? motorDevice.value.toFixed(3) 
                                : 'N/C'
                            }
                            {motorDevice?.units && typeof motorDevice.value === 'number' && (
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
                            disabled={isScanning}
                            className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">Select Signal</option>
                            {availableDevices.signals.map((device) => (
                                <option key={device} value={device}>
                                    {device}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 min-w-fit">Value:</span>
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded border flex-1">
                            {signalDevice?.connected && typeof signalDevice.value === 'number' 
                                ? signalDevice.value.toFixed(3) 
                                : 'N/C'
                            }
                            {signalDevice?.units && typeof signalDevice.value === 'number' && (
                                <span className="text-xs ml-1">{signalDevice.units}</span>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* Scan Parameters Row */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <label className="text-sm font-medium text-gray-700">Start:</label>
                <input
                    type="number"
                    value={scanStart}
                    onChange={(e) => setScanStart(parseFloat(e.target.value) || 0)}
                    disabled={isScanning}
                    className="w-24 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                
                <label className="text-sm font-medium text-gray-700">Stop:</label>
                <input
                    type="number"
                    value={scanStop}
                    onChange={(e) => setScanStop(parseFloat(e.target.value) || 0)}
                    disabled={isScanning}
                    className="w-24 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                
                <label className="text-sm font-medium text-gray-700">Step:</label>
                <input
                    type="number"
                    value={scanStep}
                    onChange={(e) => setScanStep(parseFloat(e.target.value) || 0.1)}
                    step="0.1"
                    disabled={isScanning}
                    className="w-24 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
            </div>

            {/* Control Buttons Row */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <ExperimentExecutePlanButtonGeneric
                    planName="scan"
                    kwargs={scanKwargs}
                    disabled={!selectedMotor || !selectedSignal || !motorDevice?.connected || !signalDevice?.connected || scanStep <= 0}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition-colors"
                    onSuccess={handleScanSuccess}
                    onError={handleScanError}
                />
                
                {/* Scan Info */}
                <div className="text-sm text-gray-600">
                    {numSteps > 1 && (
                        <span>({numSteps} points)</span>
                    )}
                </div>
                
                {/* Divider */}
                <div className="h-8 w-px bg-gray-300"></div>
                
                {/* Plot Control Buttons */}
                <button
                    onClick={handleClearPlots}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                    Clear
                </button>
                <button
                    onClick={handleTogglePlots}
                    className={cn(
                        "px-4 py-2 text-white text-sm font-medium rounded-md transition-colors",
                        plotsEnabled 
                            ? "bg-red-600 hover:bg-red-700" 
                            : "bg-gray-600 hover:bg-gray-700"
                    )}
                >
                    {plotsEnabled ? 'Done' : 'Resume'}
                </button>
            </div>

            {/* Motor vs Signal XY Plot */}
            <div className="h-[400px] bg-white border border-gray-200 rounded-lg p-4">
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
        </div>
    );
}
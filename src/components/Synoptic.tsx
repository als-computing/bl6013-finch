import React from 'react';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import { cn } from '@/lib/utils';

export interface SynopticPV {
    /** The EPICS PV name */
    pv: string;
    /** Display name/nickname for this specific PV (optional, defaults to pv) */
    nickname?: string;
}

export interface SynopticDevice {
    /** Display name for the device/component */
    name: string;
    /** Icon to display for this device (optional) */
    icon?: React.ReactNode;
    /** Array of PVs associated with this device */
    pvs: SynopticPV[];
    /** Optional subtitle beneath the display name */
    subtitle?: string;
    /** Group/category for organizing devices (optional) */
    group?: string;
    /** If true, this device will be displayed as a special beamline card */
    isBeamline?: boolean;
}

export interface SynopticProps {
    /** Array of devices to display in the synoptic */
    devices: SynopticDevice[];
    /** Additional CSS classes for the container */
    className?: string;
    /** 
     * Controls layout behavior for cards:
     * - true: Cards can wrap to new rows (default)
     * - false: Cards stay on one horizontal row with horizontal scrollbar 
     */
    allowWrap?: boolean;
}

export default function Synoptic({ devices, className = '', allowWrap = true }: SynopticProps) {
    const [selectedDevice, setSelectedDevice] = React.useState<SynopticDevice | null>(null);
    
    // Extract all PV names from all devices for the hook
    const pvList = devices.flatMap(device => device.pvs.map(pv => pv.pv));
    
    // Get live device data from WebSocket
    const { devices: ophydDevices } = useOphydPVSocket(pvList);
    console.log('Ophyd Devices Data:', ophydDevices); // Debug log to check data structure

    const handleCardClick = (device: SynopticDevice) => {
        // Toggle selection - if same device is clicked, deselect it
        setSelectedDevice(selectedDevice?.name === device.name ? null : device);
    };

    const renderDeviceCard = (device: SynopticDevice, index: number, isBeamline: boolean = false) => {
        const displayName = device.name;
        
        // Check if ALL of the device's PVs are connected (fully connected)
        const isFullyConnected = device.pvs.length > 0 && device.pvs.every(pv => ophydDevices[pv.pv]?.connected);
        const isSelected = selectedDevice?.name === device.name;
        
        return (
            <div 
                key={`${device.name}-${index}`} 
                onClick={() => handleCardClick(device)}
                className={cn(
                    "flex flex-col items-center p-2 h-48 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md",
                    !allowWrap && "flex-shrink-0",
                    isSelected && "ring-2 ring-blue-400 scale-105",
                    !isSelected && "scale-100",
                    isBeamline ? "min-w-40" : "min-w-32", // Beamline card is wider
                    isFullyConnected 
                        ? "bg-transparent border-sky-800 text-white hover:bg-sky-900"
                        : "bg-transparent border-gray-200 text-slate-300 hover:bg-gray-100 opacity-60"
                )}
            >
                {/* Icon */}
                {device.icon && (
                    <div className="w-16 h-16 mb-1 flex items-center justify-center">
                        {React.cloneElement(device.icon as React.ReactElement, { size: 48 })}
                    </div>
                )}
                
                {/* Device Name */}
                <h3 className="text-xs font-semibold text-center mb-1">
                    {displayName}
                </h3>
                
                {/* subtitle */}
                {device.subtitle && (
                    <span className="text-xs opacity-70 mb-1">
                        {device.subtitle}
                    </span>
                )}
                
                {/* PV List - Scrollable */}
                <div className="w-full flex-1 overflow-y-auto">
                    <div className="space-y-0 max-h-20">
                        {device.pvs.map((pvConfig) => {
                            const ophydDevice = ophydDevices[pvConfig.pv];
                            const isConnected = ophydDevice?.connected || false;
                            const value = isConnected && ophydDevice?.value !== undefined ? ophydDevice.value : (isConnected ? 'N/A' : 'N/C');
                            const units = (ophydDevice?.units || '').slice(0, 3);
                            const pvDisplayName = pvConfig.nickname || pvConfig.pv;
                            
                            return (
                                <div 
                                    key={pvConfig.pv}
                                    className="flex justify-between items-center text-xs rounded px-1.5"
                                >
                                    <span className="font-medium truncate flex-1 mr-1">{pvDisplayName}</span>
                                    <span className="font-mono font-bold flex-shrink-0">
                                        {typeof value === 'number' ? value.toFixed(2) : value}
                                        {units && typeof value === 'number' && <span className="ml-0.5">{units}</span>}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={cn(className)}>
            {/* Device Cards with Connecting Lines */}
            <div className={cn(
                "flex gap-4 p-4 relative items-center",
                allowWrap ? 'flex-wrap' : 'overflow-x-auto'
            )}>
                {/* All Devices - Regular and Beamline mixed together */}
                {devices.map((device, index) => {
                    // Check if we should show a connecting line to the next device (only for regular devices)
                    const showConnectingLineRight = !device.isBeamline && index < devices.length - 1 && !devices[index + 1]?.isBeamline;
                    // Check if we should show a connecting line to the left of beamline device (when previous device is regular)
                    const showConnectingLineLeft = device.isBeamline && index > 0 && !devices[index - 1]?.isBeamline;
                    
                    const nextDevice = devices[index + 1];
                    const prevDevice = devices[index - 1];
                    
                    const isFullyConnected = device.pvs.length > 0 && device.pvs.every(pv => ophydDevices[pv.pv]?.connected);
                    const isNextFullyConnected = nextDevice && nextDevice.pvs.length > 0 && nextDevice.pvs.every(pv => ophydDevices[pv.pv]?.connected);
                    const isPrevFullyConnected = prevDevice && prevDevice.pvs.length > 0 && prevDevice.pvs.every(pv => ophydDevices[pv.pv]?.connected);
                    
                    // Line color: sky if both connected devices are fully connected, gray otherwise
                    const rightLineColor = isFullyConnected && isNextFullyConnected ? 'bg-sky-400' : 'bg-gray-300';
                    const leftLineColor = isPrevFullyConnected && isFullyConnected ? 'bg-sky-400' : 'bg-gray-300';
                    
                    return (
                        <div key={`${device.name}-${index}`} className={cn("flex items-center", !allowWrap && "flex-shrink-0")}>
                            {/* Connecting Line to the left (for beamline devices following regular devices) */}
                            {showConnectingLineLeft && (
                                <div className={cn("w-8 h-0.5 mx-2 transition-colors duration-200", leftLineColor)}></div>
                            )}
                            
                            {renderDeviceCard(device, index, device.isBeamline)}
                            
                            {/* Connecting Line to the right (only between regular devices) */}
                            {showConnectingLineRight && (
                                <div className={cn("w-8 h-0.5 mx-2 transition-colors duration-200", rightLineColor)}></div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Details Section - Shows when a device is selected */}
            {selectedDevice && (
                <div className="mt-4 p-6 bg-gray-100 border-2 border-gray-300 rounded-lg relative">
                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedDevice(null)}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors duration-150 text-gray-600 hover:text-gray-800"
                        aria-label="Close details"
                    >
                        ×
                    </button>
                    
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 pr-10">Device Details: {selectedDevice.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Device Information</h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-medium">Name:</span> {selectedDevice.name}</p>
                                <p><span className="font-medium">Group:</span> {selectedDevice.group || 'N/A'}</p>
                                <p><span className="font-medium">Number of PVs:</span> {selectedDevice.pvs.length}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">PV Details</h3>
                            <div className="space-y-2">
                                {selectedDevice.pvs.map((pv) => {
                                    const ophydDevice = ophydDevices[pv.pv];
                                    const isConnected = ophydDevice?.connected || false;
                                    const value = isConnected && ophydDevice?.value !== undefined ? ophydDevice.value : (isConnected ? 'N/A' : 'N/C');
                                    const units = (ophydDevice?.units || '').slice(0, 3);
                                    
                                    return (
                                        <div key={pv.pv} className="p-3 bg-white rounded border">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium text-sm">{pv.nickname || pv.pv}</span>
                                                <span className={`text-xs px-2 py-1 rounded ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {isConnected ? 'Connected' : 'Disconnected'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                <p><span className="font-medium">PV:</span> {pv.pv}</p>
                                                <p><span className="font-medium">Value:</span> {typeof value === 'number' ? value.toFixed(3) : value} {units}</p>
                                                {ophydDevice?.timestamp && (
                                                    <p><span className="font-medium">Last Update:</span> {new Date(ophydDevice.timestamp * 1000).toLocaleTimeString()}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        <p>Click the device card again or use the × button to close this details view.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
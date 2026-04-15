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
    /** Group/category for organizing devices (optional) */
    group?: string;
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

    return (
        <div className={cn(className)}>
            {/* Device Cards with Connecting Lines */}
            <div className={cn(
                "flex gap-4 p-4 relative",
                allowWrap ? 'flex-wrap' : 'overflow-x-auto'
            )}>
                {devices.map((device, index) => {
                    const displayName = device.name;
                    
                    // Check if any of the device's PVs are connected
                    const isAnyConnected = device.pvs.some(pv => ophydDevices[pv.pv]?.connected);
                    const isSelected = selectedDevice?.name === device.name;
                    
                    // Check if we should show a connecting line to the next device
                    const showConnectingLine = index < devices.length - 1;
                    const nextDevice = devices[index + 1];
                    const isNextConnected = nextDevice?.pvs.some(pv => ophydDevices[pv.pv]?.connected);
                    
                    // Line color: blue if both current and next devices are connected, gray otherwise
                    const lineColor = isAnyConnected && isNextConnected ? 'bg-blue-400' : 'bg-gray-300';
                    
                    return (
                        <div key={`${device.name}-${index}`} className={cn("flex items-center", !allowWrap && "flex-shrink-0")}>
                            {/* Device Card */}
                            <div 
                                onClick={() => handleCardClick(device)}
                                className={cn(
                                    "flex flex-col items-center p-3 min-w-48 h-72 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md",
                                    !allowWrap && "flex-shrink-0",
                                    isSelected && "ring-2 ring-blue-400 scale-105",
                                    !isSelected && "scale-100",
                                    isAnyConnected 
                                        ? "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
                                        : "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100"
                                )}
                            >
                                {/* Icon */}
                                {device.icon && (
                                    <div className="w-24 h-24 mb-2 flex items-center justify-center">
                                        {React.cloneElement(device.icon as React.ReactElement, { size: 72 })}
                                    </div>
                                )}
                                
                                {/* Device Name */}
                                <h3 className="text-lg font-semibold text-center mb-2">
                                    {displayName}
                                </h3>
                                
                                {/* Group/Category */}
                                {device.group && (
                                    <span className="text-xs opacity-70 mb-2">
                                        {device.group}
                                    </span>
                                )}
                                
                                {/* PV List - Scrollable */}
                                <div className="w-full flex-1 overflow-y-auto">
                                    <div className="space-y-1 max-h-32">
                                        {device.pvs.map((pvConfig) => {
                                        const ophydDevice = ophydDevices[pvConfig.pv];
                                        const isConnected = ophydDevice?.connected || false;
                                        const value = isConnected && ophydDevice?.value !== undefined ? ophydDevice.value : (isConnected ? 'N/A' : 'N/C');
                                        const units = ophydDevice?.units || '';
                                        const pvDisplayName = pvConfig.nickname || pvConfig.pv;
                                        
                                        return (
                                            <div 
                                                key={pvConfig.pv}
                                                className="flex justify-between items-center text-xs bg-white/30 rounded px-2 py-1"
                                            >
                                                <span className="font-medium">{pvDisplayName}</span>
                                                <span className="font-mono font-bold">
                                                    {typeof value === 'number' ? value.toFixed(3) : value}
                                                    {units && typeof value === 'number' && <span className="ml-1">{units}</span>}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Connecting Line */}
                            {showConnectingLine && (
                                <div className={cn("w-8 h-0.5 mx-2 transition-colors duration-200", lineColor)}></div>
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
                                    const units = ophydDevice?.units || '';
                                    
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
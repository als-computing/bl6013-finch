import React from 'react';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import { Gear, Camera } from "@phosphor-icons/react";
import { cn } from '@/lib/utils';

export interface TablePV {
    /** The EPICS PV name */
    pv: string;
    /** Display name for this PV (optional, defaults to pv) */
    name?: string;
}

export interface TableColumn {
    /** Column heading/title */
    heading: string;
    /** Icon for the column (optional, defaults to gear) */
    icon?: React.ReactNode;
    /** Array of PVs in this column */
    pvs: TablePV[];
}

export interface TablePVProps {
    /** Array of columns to display */
    columns: TableColumn[];
    /** Additional CSS classes for the container */
    className?: string;
    /** Maximum height for each column content area (enables scrolling if content exceeds) */
    maxColumnHeight?: string;
    /** Additional CSS classes for column headers */
    headerClassName?: string;
    /** Additional CSS classes for all PV rows */
    rowClassName?: string;
    /** Additional CSS classes for connected PV rows */
    connectedRowClassName?: string;
    /** Additional CSS classes for disconnected PV rows */
    disconnectedRowClassName?: string;
}

export default function TablePV({ 
    columns, 
    className = '', 
    maxColumnHeight,
    headerClassName,
    rowClassName,
    connectedRowClassName,
    disconnectedRowClassName 
}: TablePVProps) {
    const [selectedPV, setSelectedPV] = React.useState<string | null>(null);
    
    // Extract all PV names from all columns for the hook
    const allPVs = columns.flatMap(column => column.pvs.map(pv => pv.pv));
    
    // Get live device data from WebSocket
    const { devices: ophydDevices } = useOphydPVSocket(allPVs);

    const handlePVClick = (pvName: string) => {
        // Toggle selection - if same PV is clicked, deselect it
        setSelectedPV(selectedPV === pvName ? null : pvName);
    };

    return (
        <div className={cn("text-white bg-sky-950 rounded-lg overflow-x-auto p-4", className)}>
            {/* Table Container */}
            <div className="  m-auto w-fit">
                <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(180px, 200px))` }}>
                    {columns.map((column, columnIndex) => {
                        // Calculate connected devices for this column
                        const connectedDevices = column.pvs.filter(pv => ophydDevices[pv.pv]?.connected).length;
                        const totalDevices = column.pvs.length;
                        const defaultIcon = <Gear size={24} />;
                        
                        return (
                            <div key={columnIndex} className="">
                                {/* Column Header */}
                                <div className={cn("pb-2", headerClassName)}>
                                    <div className="flex items-center gap-2">
                                        {/* Icon */}
                                        <div className="flex-shrink-0">
                                            {column.icon || defaultIcon}
                                        </div>
                                        
                                        {/* Heading */}
                                        <h3 className="text-white text-xl truncate flex-1">
                                            {column.heading}
                                        </h3>
                                        
                                        {/* Connection Status */}
                                        <div className="text-xs text-white/80 flex-shrink-0">
                                            <span>
                                                {connectedDevices}
                                            </span>
                                            {' / '}{totalDevices}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* PV List */}
                                <div 
                                    className={cn(maxColumnHeight && "overflow-y-auto")}
                                    style={maxColumnHeight ? { maxHeight: maxColumnHeight } : {}}
                                >
                                    {column.pvs.map((pv) => {
                                        const ophydDevice = ophydDevices[pv.pv];
                                        const isConnected = ophydDevice?.connected || false;
                                        const value = isConnected && ophydDevice?.value !== undefined ? ophydDevice.value : 'N/C';
                                        const units = ophydDevice?.units || '';
                                        const displayName = pv.name || pv.pv;
                                        const isSelected = selectedPV === pv.pv;
                                        
                                        return (
                                            <div 
                                                key={pv.pv}
                                                onClick={() => handlePVClick(pv.pv)}
                                                className={cn(
                                                    "px-0 py-1 cursor-pointer transition-colors hover:bg-sky-800",
                                                    isSelected && "bg-sky-700",
                                                    !isConnected ? "text-gray-400" : "text-white",
                                                    rowClassName,
                                                    isConnected ? connectedRowClassName : disconnectedRowClassName
                                                )}
                                            >
                                                <div className="flex justify-between items-center min-w-0">
                                                    <span className="text-xs font-medium truncate mr-2 flex-1">
                                                        {displayName}
                                                    </span>
                                                    <span className="text-xs font-mono text-right flex-shrink-0">
                                                        {typeof value === 'number' ? value.toFixed(3) : value}
                                                        {units && typeof value === 'number' && (
                                                            <span className="text-xs ml-1">{units.slice(0, 3)}</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* PV Details Section */}
            {selectedPV && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg relative">
                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedPV(null)}
                        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors text-gray-600 hover:text-gray-800"
                        aria-label="Close PV details"
                    >
                        ×
                    </button>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 pr-8">PV Details</h3>
                    
                    {(() => {
                        const ophydDevice = ophydDevices[selectedPV];
                        const isConnected = ophydDevice?.connected || false;
                        const value = isConnected && ophydDevice?.value !== undefined ? ophydDevice.value : 'N/C';
                        const units = ophydDevice?.units || '';
                        
                        // Find the PV info from columns
                        const pvInfo = columns.flatMap(col => col.pvs).find(pv => pv.pv === selectedPV);
                        
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">PV Information</h4>
                                    <div className="space-y-1">
                                        <p><span className="font-medium">PV Name:</span> {selectedPV}</p>
                                        <p><span className="font-medium">Display Name:</span> {pvInfo?.name || selectedPV}</p>
                                        <p><span className="font-medium">Status:</span> 
                                            <span className={cn(
                                                "ml-1 px-2 py-0.5 rounded text-xs",
                                                isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                            )}>
                                                {isConnected ? 'Connected' : 'Disconnected'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Current Values</h4>
                                    <div className="space-y-1">
                                        <p><span className="font-medium">Value:</span> {typeof value === 'number' ? value.toFixed(6) : value}</p>
                                        <p><span className="font-medium">Units:</span> {units || 'N/A'}</p>
                                        {ophydDevice?.timestamp && (
                                            <p><span className="font-medium">Last Update:</span> {new Date(ophydDevice.timestamp * 1000).toLocaleString()}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
import React, { useState } from 'react';
import Scan from '@/components/Scan';
import Stripchart from '@/components/Stripchart';

type ViewMode = 'scan' | 'stripchart';

export interface ScanOrStripchartGreyProps {
    /** Array of motor PV names for stripchart functionality */
    motorPVs?: string[];
    /** Array of signal PV names for stripchart functionality */
    signalPVs?: string[];
    /** Array of motor device names for scan functionality */
    motorOphydNames?: string[];
    /** Array of signal device names for scan functionality */
    signalOphydNames?: string[];
    /** Additional CSS classes for the container */
    className?: string;
}

export default function ScanOrStripchartGrey({ 
    motorPVs = [], 
    signalPVs = [], 
    motorOphydNames,
    signalOphydNames,
    className = '' 
}: ScanOrStripchartGreyProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('scan');

    return (
        <div className={`h-full flex flex-col text-gray-800 ${className}`}>
            {/* Header with Radio Button Selection */}
            <div className="flex items-center gap-6 p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Data Visualization</h2>
                
                {/* Radio Button Group */}
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="viewMode"
                            value="scan"
                            checked={viewMode === 'scan'}
                            onChange={(e) => setViewMode(e.target.value as ViewMode)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Scan</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="viewMode"
                            value="stripchart"
                            checked={viewMode === 'stripchart'}
                            onChange={(e) => setViewMode(e.target.value as ViewMode)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Strip Chart</span>
                    </label>
                </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
                {viewMode === 'scan' ? (
                    <Scan 
                        motorOphydNames={motorOphydNames}
                        signalOphydNames={signalOphydNames}
                    />
                ) : (
                    <Stripchart 
                        motorPVs={motorPVs}
                        signalPVs={signalPVs}
                    />
                )}
            </div>
        </div>
    );
}
import React, { useState } from 'react';
import Scan from '@/components/Scan';
import Stripchart from '@/components/Stripchart';
import { Microscope, ChartScatter } from '@phosphor-icons/react';

type ViewMode = 'scan' | 'stripchart';

export interface ScanOrStripchartProps {
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

export default function ScanOrStripchart({ 
    motorPVs = [], 
    signalPVs = [], 
    motorOphydNames,
    signalOphydNames,
    className = '' 
}: ScanOrStripchartProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('scan');

    return (
        <div className={`h-full flex flex-col bg-sky-950 ${className}`}>
            {/* Header with Tab Selection */}
            <div className="flex items-center justify-center gap-24 p-3">
                <button
                    onClick={() => setViewMode('scan')}
                    className={`flex items-center gap-2 cursor-pointer transition-colors pb-1 ${
                        viewMode === 'scan'
                            ? 'text-white font-bold border-b-2 border-white'
                            : 'text-gray-400 font-normal hover:text-gray-300 border-b-2 border-transparent'
                    }`}
                >
                    <Microscope size={24} />
                    <span>Scan</span>
                </button>
                
                <button
                    onClick={() => setViewMode('stripchart')}
                    className={`flex items-center gap-2 cursor-pointer transition-colors pb-1 ${
                        viewMode === 'stripchart'
                            ? 'text-white font-bold border-b-2 border-white'
                            : 'text-gray-400 font-normal hover:text-gray-300 border-b-2 border-transparent'
                    }`}
                >
                    <ChartScatter size={24} />
                    <span>Strip Chart</span>
                </button>
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
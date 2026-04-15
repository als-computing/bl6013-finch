import React from 'react';

export interface ScanProps {
    /** Additional CSS classes for the container */
    className?: string;
}

export default function Scan({ className = '' }: ScanProps) {
    return (
        <div className={`h-full flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-dashed border-blue-200 text-gray-800 ${className}`}>
            <div className="text-center">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Scan View</h3>
                <p className="text-blue-600 text-sm">Scan configuration and live data visualization</p>
            </div>
        </div>
    );
}
import { useState } from "react";
import CameraContainer from "@/components/Camera/CameraContainer";
import { Gear, CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface Detector {
    /** EPICS PV prefix for the detector */
    prefix: string;
    /** Optional display name. If not provided, prefix will be used */
    nickname?: string;
}

interface MultiCameraSelectProps {
    /** List of available detectors */
    detectors: Detector[];
    /** Additional CSS classes for the container */
    className?: string;
}

export default function MultiCameraSelect({ detectors, className }: MultiCameraSelectProps) {
    const [selectedDetector, setSelectedDetector] = useState<Detector>(detectors[0] || { prefix: "", nickname: "" });
    const [showSettings, setShowSettings] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const getDisplayName = (detector: Detector) => detector.nickname || detector.prefix;

    const handleDetectorChange = (detector: Detector) => {
        setSelectedDetector(detector);
        setShowDropdown(false);
    };

    const toggleControlPanel = () => {
        setShowSettings(!showSettings);
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    return (
        <div className={cn("", className)}>
            {/* Header */}
            <div className="flex justify-between items-center p-4">
                {/* Detector Selector - Left Side */}
                <div className="relative">
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center space-x-2 text-lg font-semibold text-white hover:text-gray-300 transition-colors"
                    >
                        <span>Detector: {getDisplayName(selectedDetector)}</span>
                        <CaretDown size={16} className={cn("transition-transform", showDropdown && "rotate-180")} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-[200px]">
                            {detectors.map((detector, index) => (
                                <button
                                    key={`${detector.prefix}-${index}`}
                                    onClick={() => handleDetectorChange(detector)}
                                    className={cn(
                                        "w-full text-left px-4 py-2 text-black hover:bg-gray-100 transition-colors first:rounded-t-md last:rounded-b-md",
                                        selectedDetector.prefix === detector.prefix && "bg-blue-50 text-blue-700"
                                    )}
                                >
                                    {getDisplayName(detector)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Settings Gear - Right Side */}
                <button
                    onClick={toggleControlPanel}
                    className={cn(
                        "p-2 transition-colors",
                        showSettings 
                            ? "text-white hover:text-gray-300" 
                            : "text-gray-400 hover:text-white"
                    )}
                    title="Toggle Control Panel"
                >
                    <Gear size={24} />
                </button>
            </div>

            {/* Camera Container */}
            <div className="w-fit" key={selectedDetector.prefix}>
                <CameraContainer 
                    prefix={selectedDetector.prefix} 
                    enableControlPanel={true} 
                    enableSettings={showSettings} 
                    canvasSize="medium"
                />
            </div>
        </div>
    );
}
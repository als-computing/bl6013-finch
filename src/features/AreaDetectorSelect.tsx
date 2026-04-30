import { useState, useRef, useEffect } from "react";
import AreaDetectorPanel from "./AreaDetectorPanel";
import { CameraContainerProps } from "@/components/Camera/CameraContainer";
import { CaretDown } from "@phosphor-icons/react";

export interface DetectorConfig extends Omit<CameraContainerProps, "enableSettings"> {
    /** Display label shown in the dropdown and above the panel. Defaults to the prefix value. */
    label?: string;
    /** ADL or BOB file name to load in the MEDM panel (e.g. `'ADBase.adl'`). */
    edmFileName: string;
    /** EPICS cam record suffix passed as `R` to ReactEDM. Defaults to `'cam1'`. */
    edmR?: string;
}

interface AreaDetectorSelectProps {
    /** List of detector configurations to offer in the dropdown. */
    detectors: DetectorConfig[];
    /** Additional CSS classes for the outer container. */
    className?: string;
}

export default function AreaDetectorSelect({ detectors, className }: AreaDetectorSelectProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selected = detectors[selectedIndex];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!selected) return null;

    const { label, prefix, edmFileName, edmR, ...cameraProps } = selected;
    const displayName = label ?? prefix;

    return (
        <div className={`flex flex-col gap-3 h-fit ${className ?? ""}`}>
            {/* Dropdown title */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setOpen((prev) => !prev)}
                    className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide hover:text-sky-700 transition-colors"
                >
                    {displayName}
                    <CaretDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded shadow-md min-w-[8rem]">
                        {detectors.map((det, i) => (
                            <button
                                key={det.prefix}
                                onClick={() => { setSelectedIndex(i); setOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${i === selectedIndex ? "font-semibold text-sky-700" : "text-gray-700"}`}
                            >
                                {det.label ?? det.prefix}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <AreaDetectorPanel
                key={prefix}
                prefix={prefix}
                edmFileName={edmFileName}
                edmR={edmR}
                hideLabel
                {...cameraProps}
            />
        </div>
    );
}

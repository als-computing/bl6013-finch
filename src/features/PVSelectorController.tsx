import { useState, useRef, useEffect } from "react";
import useOphydPVSocket from "@/api/ophyd/useOphydPVSocket";
import DeviceControllerBox from "@/components/DeviceControllerBox";
import { CaretDown } from "@phosphor-icons/react";

export interface PVConfig {
    /** Primary PV name (setpoint). */
    pv: string;
    /** Optional readback PV. When provided, its value is shown as the current position. */
    rbvPv?: string;
    /** Human-readable label for the selector. Defaults to `pv`. */
    label?: string;
    /** Optional icon rendered in the DeviceControllerBox header. */
    svgIcon?: React.ReactNode;
    /** Display title passed to DeviceControllerBox instead of the device name. */
    title?: string;
}

export interface PVSelectorControllerProps {
    /** List of PVs to make selectable. */
    pvs: PVConfig[];
    /** When true, automatically uses `<pv>.RBV` as the readback PV for any entry that doesn't already specify `rbvPv`. */
    autoRBV?: boolean;
    /** WebSocket URL override for the Ophyd socket. */
    wsUrl?: string;
    /** Additional CSS classes for the outer container. */
    className?: string;
}

export default function PVSelectorController({ pvs, autoRBV = false, wsUrl, className }: PVSelectorControllerProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const resolvedPVs = autoRBV
        ? pvs.map((cfg) => ({ ...cfg, rbvPv: cfg.rbvPv ?? `${cfg.pv}.RBV` }))
        : pvs;

    // Subscribe only to the selected PV (and its RBV if present) so the socket is
    // created/destroyed on selection change rather than keeping all PVs alive at once.
    const selected = resolvedPVs[selectedIndex];
    const activePVNames = selected
        ? selected.rbvPv ? [selected.pv, selected.rbvPv] : [selected.pv]
        : [];
    const { devices, handleSetValueRequest, toggleDeviceLock } = useOphydPVSocket(activePVNames, wsUrl);

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

    const device = devices[selected.pv];
    const deviceRBV = selected.rbvPv ? devices[selected.rbvPv] : undefined;

    return (
        <div className={`flex flex-col gap-3 h-fit ${className ?? ""}`}>
            {/* Dropdown selector */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setOpen((prev) => !prev)}
                    className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide hover:text-sky-700 transition-colors"
                >
                    {selected.label ?? selected.pv}
                    <CaretDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded shadow-md min-w-[10rem]">
                        {resolvedPVs.map((cfg, i) => (
                            <button
                                key={cfg.pv}
                                onClick={() => { setSelectedIndex(i); setOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${i === selectedIndex ? "font-semibold text-sky-700" : "text-gray-700"}`}
                            >
                                {cfg.label ?? cfg.pv}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {device && (
                <DeviceControllerBox
                    device={device}
                    deviceRBV={deviceRBV}
                    handleSetValueRequest={handleSetValueRequest}
                    handleLockClick={toggleDeviceLock}
                    svgIcon={selected.svgIcon}
                    title={selected.title}
                />
            )}
        </div>
    );
}

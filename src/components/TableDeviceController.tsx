import { useState } from "react";

import { Lock, LockOpen, ArrowsLeftRight } from "@phosphor-icons/react";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "./ui/table";
import ControllerAbsoluteMove from "./ControllerAbsoluteMove";
import ControllerRelativeMove from "./ControllerRelativeMove";
import { Devices, OphydDevices } from "@/types/deviceControllerTypes";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

type Theme = {
    container: string;
    heading: string;
    tableHeader: string;
    tableRow: string;
    deviceNameCell: string;
    lockButton: string;
    currentValueCell: string;
    controlInput: string;
    toggleButton: string;
};

const themes: Record<'light' | 'dark', Theme> = {
    light: {
        container: "bg-slate-200",
        heading: "text-sky-900 font-medium",
        tableHeader: "",
        tableRow: "hover:bg-transparent",
        deviceNameCell: "text-black hover:bg-slate-100",
        lockButton: "text-sky-700 hover:text-sky-900 shrink-0",
        currentValueCell: "text-center text-md text-sky-700 font-medium",
        controlInput: "bg-sky-200 shadow-inner rounded-md text-black",
        toggleButton: "text-sky-700 hover:text-sky-900 shrink-0",
    },
    dark: {
        container: "bg-sky-900",
        heading: "text-white font-medium",
        tableHeader: "[&_tr]:border-0",
        tableRow: "border-0 hover:bg-transparent",
        deviceNameCell: "text-white hover:bg-sky-800",
        lockButton: "text-sky-300 hover:text-white shrink-0",
        currentValueCell: "text-center text-md text-white font-medium",
        controlInput: "bg-sky-200 shadow-inner rounded-md text-black",
        toggleButton: "text-sky-300 hover:text-white shrink-0",
    },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type TableDeviceControllerProps = {
    /** Map of device names to their current state objects. Each entry renders as one table row. */
    devices: Devices | OphydDevices;
    /** Called when the user submits an absolute or relative move value for a device. */
    handleSetValueRequest: (deviceName: string, value: number) => void;
    /** Called to toggle the locked state for a device, enabling or disabling its move controls. */
    toggleDeviceLock: (deviceName: string, locked: boolean) => void;
    /** Called to toggle the expanded state for a device row, showing or hiding its raw JSON data. */
    toggleExpand: (deviceName: string) => void;
    /** When true, merges the Absolute Move and Relative Move columns into one. The cell shows
     *  Absolute Move by default; clicking the ArrowsLeftRight icon switches that row to Jog. */
    combineControlColumns?: boolean;
    /** Color scheme. Defaults to 'light'. */
    mode?: 'light' | 'dark';
    /** Additional CSS classes applied to the root container. */
    className?: string;
    /** Overrides the theme style for all TableHead elements. */
    classNameHeading?: string;
    /** Overrides the theme style for the device name cell (affects name text and expanded JSON). */
    classNameDeviceNameCell?: string;
    /** Overrides the theme style for the lock icon button. */
    classNameLockButton?: string;
    /** Overrides the theme style for the current value cell. */
    classNameCurrentValueCell?: string;
    /** Overrides the theme style applied to the inner input of controller components. */
    classNameControlInput?: string;
    /** Overrides the theme style for the ArrowsLeftRight toggle button (combined mode only). */
    classNameToggleButton?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TableDeviceController({
    devices,
    handleSetValueRequest,
    toggleDeviceLock,
    toggleExpand,
    combineControlColumns = true,
    mode = 'dark',
    className,
    classNameHeading,
    classNameDeviceNameCell,
    classNameLockButton,
    classNameCurrentValueCell,
    classNameControlInput,
    classNameToggleButton,
    ...props
}: TableDeviceControllerProps) {

    const t = themes[mode];

    const [jogRows, setJogRows] = useState<Record<string, boolean>>({});

    const toggleRowMode = (deviceName: string) => {
        setJogRows((prev) => ({ ...prev, [deviceName]: !prev[deviceName] }));
    };

    return (
        <div className={cn("p-4 w-fit h-fit rounded-lg shadow-lg", t.container, className)} {...props}>
            <Table className="max-w-[900px] m-auto">
                <TableHeader className={t.tableHeader}>
                    <TableRow>
                        <TableHead className={cn("w-48", t.heading, classNameHeading)}>Device Name</TableHead>
                        <TableHead className={cn("text-center w-48", t.heading, classNameHeading)}>Current Value</TableHead>
                        {combineControlColumns ? (
                            <TableHead className={cn("text-center", t.heading, classNameHeading)}>Move</TableHead>
                        ) : (
                            <>
                                <TableHead className={cn("text-center pr-12", t.heading, classNameHeading)}>Absolute Move</TableHead>
                                <TableHead className={cn("text-center", t.heading, classNameHeading)}>Relative Move</TableHead>
                            </>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.keys(devices).map((deviceName) => {
                        const device = devices[deviceName];
                        return (
                            <TableRow key={deviceName} className={t.tableRow}>
                                <TableCell
                                    className={cn("hover:cursor-pointer py-0", t.deviceNameCell, classNameDeviceNameCell)}
                                    onClick={() => toggleExpand(deviceName)}
                                >
                                    <>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleDeviceLock(deviceName, !device.locked); }}
                                                className={cn(t.lockButton, classNameLockButton)}
                                            >
                                                {device.locked ? <Lock size={16} weight="fill" /> : <LockOpen size={16} />}
                                            </button>
                                            <p>{deviceName}</p>
                                        </div>
                                        {device.expanded && <pre className="text-xs">{JSON.stringify(device, null, 2)}</pre>}
                                    </>
                                </TableCell>
                                <TableCell className={cn(t.currentValueCell, classNameCurrentValueCell)}>
                                    {`${typeof device.value === 'number' ? device.value.toPrecision(4) : device.value} ${device.units ? device.units.slice(0, 3) : 'n/a'}`}
                                </TableCell>
                                {combineControlColumns ? (
                                    <TableCell>
                                        <div className="flex items-center justify-between gap-2 w-48">
                                            {jogRows[deviceName] ? (
                                                <ControllerRelativeMove
                                                    className="justify-center"
                                                    handleEnter={(input) => input !== null && handleSetValueRequest(deviceName, input)}
                                                    inputLabel={device.units && device.units.slice(0, 3)}
                                                    currentValue={typeof device.value === 'number' ? device.value : null}
                                                    classNameInput={cn(t.controlInput, classNameControlInput)}
                                                    locked={device.locked}
                                                />
                                            ) : (
                                                <ControllerAbsoluteMove
                                                    handleEnter={(input) => input !== null && handleSetValueRequest(deviceName, input)}
                                                    inputLabel={device.units && device.units.slice(0, 3)}
                                                    classNameInput={cn(t.controlInput, classNameControlInput)}
                                                    locked={device.locked}
                                                    showLabel={false}
                                                />
                                            )}
                                            <button
                                                onClick={() => toggleRowMode(deviceName)}
                                                className={cn(t.toggleButton, classNameToggleButton)}
                                                title={jogRows[deviceName] ? "Switch to absolute move" : "Switch to jog"}
                                            >
                                                <ArrowsLeftRight size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                ) : (
                                    <>
                                        <TableCell className="pr-12">
                                            <ControllerAbsoluteMove
                                                handleEnter={(input) => input !== null && handleSetValueRequest(deviceName, input)}
                                                inputLabel={device.units && device.units.slice(0, 3)}
                                                classNameInput={cn(t.controlInput, classNameControlInput)}
                                                locked={device.locked}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <ControllerRelativeMove
                                                className="justify-center"
                                                handleEnter={(input) => input !== null && handleSetValueRequest(deviceName, input)}
                                                inputLabel={device.units && device.units.slice(0, 3)}
                                                currentValue={typeof device.value === 'number' ? device.value : null}
                                                classNameInput={cn(t.controlInput, classNameControlInput)}
                                                locked={device.locked}
                                            />
                                        </TableCell>
                                    </>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

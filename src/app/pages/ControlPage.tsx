import Paper from "@/components/Paper";
import EndstationViewer from "@/components/RIXSSpectrometer3D";
import TablePVController from "@/components/TablePVController";
import { useState } from "react";
import React from "react";

export default function ControlPage() {
    const [selectedDevice, setSelectedDevice] = useState<{ name: string; motors?: string[]; icon?: React.ReactNode } | null>(null);

    const handleDeviceClick = (deviceName: string, motors: string[], icon?: React.ReactNode) => {
        console.log(`Clicked device: ${deviceName} with motors: ${motors.join(', ')}`);
        setSelectedDevice({ name: deviceName, motors, icon });
    };

    return (
        <div className="h-full w-full">
            <div className="flex flex-col gap-4 h-[calc(100vh-8rem)] w-full">

                {/* Endstation Schematic - Right 2/3 */}
                <div className="w-full p-4 bg-sky-950 flex flex-wrap h-fit shadow-inner">
                        <div className="h-[calc(100%-2rem)] w-full bg-transparent flex flex-wrap">
                            <EndstationViewer 
                                className="h-96 w-full bg-transparent lg:w-1/2"
                                onDeviceClick={handleDeviceClick}
                                hideControls={true}
                                alwaysShowRegionLabels={true}
                                hideRegionOverlays={true}
                                regionLabelClassName="text-white bg-transparent"
                            />
                            <div className="w-full lg:w-1/2 px-8 min-h-96 flex items-center justify-center">
                                {selectedDevice?.motors && selectedDevice.motors.length > 0 ? (
                                    <div className="flex flex-col items-center w-full">
                                        {selectedDevice.icon && (
                                            <div className="w-48 h-48 text-white">
                                                {selectedDevice.icon}
                                            </div>
                                        )}
                                        <TablePVController pvs={selectedDevice.motors} className="bg-transparent shadow-none"/>
                                    </div>
                                ) : selectedDevice ? (
                                    <p className="text-white/60 text-sm">No motors associated with {selectedDevice.name}</p>
                                ) : (
                                    <p className="text-white/60 text-sm">Click a region in the endstation schematic to see details</p>
                                )}
                            </div>
                        </div>
                </div>


                {/* Device Info Section - Left 1/3 */}
                <div className="w-full">
                    <Paper className="h-full p-4">
                        <div className="h-full flex flex-col">
                            <h2 className="text-xl font-semibold text-teal-800 mb-4">Device Info</h2>
                            
                        </div>
                    </Paper>
                </div>
            </div>
        </div>
    );
}
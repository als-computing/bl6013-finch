import Paper from "@/components/Paper";
import EndstationViewer from "@/components/RIXSSpectrometer3D";
import { useState } from "react";

export default function ControlPage() {
    const [selectedDevice, setSelectedDevice] = useState<{ name: string; motors?: string[] } | null>(null);

    const handleDeviceClick = (deviceName: string, motors: string[]) => {
        setSelectedDevice({ name: deviceName, motors });
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
                            <div className="w-full lg:w-1/2 px-8 min-h-96">
                                {selectedDevice ? (
                                    <div className="h-full w-full max-w-96 text-left rounded-lg border-2  p-4 m-auto">
                                        <h3 className="font-semibold mb-2">Selected Device</h3>
                                        <p className="text-sm  mb-2">
                                            <span className="font-medium">Name:</span> {selectedDevice.name}
                                        </p>
                                        {selectedDevice.motors && selectedDevice.motors.length > 0 && (
                                            <div className="text-sm ">
                                                <span className="font-medium">Associated Motors:</span>
                                                <ul className="ml-4 mt-1">
                                                    {selectedDevice.motors.map((motor, index) => (
                                                        <li key={index} className="text-xs">• {motor}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full w-full max-w-96 flex items-center justify-center rounded-lg border-2 border-dashed border-teal-200">
                                        <div className="text-center">
                                            <p className="text-white/60 text-sm">Click a region in the endstation schematic to see details</p>
                                        </div>
                                    </div>
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
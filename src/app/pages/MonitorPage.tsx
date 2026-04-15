import Paper from "@/components/Paper";
import Synoptic, { SynopticDevice } from "@/components/Synoptic";
import TablePV, { TableColumn } from "@/components/TablePV";
import { Gear, Circle, ArrowsClockwise, Atom, Camera, Thermometer } from "@phosphor-icons/react";

export default function MonitorPage() {
    // Define the devices for the synoptic view
    const synopticDevices: SynopticDevice[] = [
        {
            name: 'Mono',
            icon: <Atom size={24} />,
            group: 'Optics',
            pvs: [
                { pv: 'IOC:m1', nickname: 'Theta' },
                { pv: 'IOC:m2', nickname: 'Height' },
                { pv: 'IOC:m3', nickname: 'Pitch' },
            ]
        },
        {
            name: 'Motor 4',
            icon: <Circle size={24} />,
            group: 'Motors',
            pvs: [
                { pv: 'IOC:m4' }
            ]
        },
        {
            name: 'Actuator 5',
            icon: <Gear size={24} />,
            group: 'Actuators',
            pvs: [
                { pv: 'IOC:m5' }
            ]
        },
        {
            name: 'Actuator 6',
            icon: <Gear size={24} />,
            group: 'Actuators',
            pvs: [
                { pv: 'IOC:m6' }
            ]
        },
        {
            name: 'Rotation 7',
            icon: <ArrowsClockwise size={24} />,
            group: 'Rotation',
            pvs: [
                { pv: 'IOC:m7' }
            ]
        },
        {
            name: 'Rotation 8',
            icon: <ArrowsClockwise size={24} />,
            group: 'Rotation',
            pvs: [
                { pv: 'IOC:m8' }
            ]
        },
        {
            name: 'Fake Device',
            icon: <Circle size={24} />,
            group: 'Test',
            pvs: [
                { pv: 'fakePV', nickname: 'Test Motor' }
            ]
        }
    ];

    // Define the columns for the TablePV component
    const tablePVColumns: TableColumn[] = [
        {
            heading: 'Motors',
            icon: <Gear size={24} />,
            pvs: [
                { pv: 'IOC:m1', name: 'Motor 1' },
                { pv: 'IOC:m2', name: 'Motor 2' },
                { pv: 'fake:motor3', name: 'Motor 3' },
                { pv: 'fake:motor4', name: 'Motor 4' },
                { pv: 'fake:motor5', name: 'Motor 5' },
                { pv: 'fake:motor6', name: 'Motor 6' },
                { pv: 'fake:motor7', name: 'Motor 7' },
                { pv: 'fake:motor8', name: 'Motor 8' },
                { pv: 'fake:motor9', name: 'Motor 9' },
                { pv: 'fake:motor10', name: 'Motor 10' },
                { pv: 'fake:motor11', name: 'Motor 11' },
                { pv: 'fake:motor12', name: 'Motor 12' },
                { pv: 'fake:motor13', name: 'Motor 13' },
                { pv: 'fake:motor14', name: 'Motor 14' },
                { pv: 'fake:motor15', name: 'Motor 15' },
                { pv: 'fake:motor16', name: 'Motor 16' },
                { pv: 'fake:motor17', name: 'Motor 17' },
                { pv: 'fake:motor18', name: 'Motor 18' },
                { pv: 'fake:motor19', name: 'Motor 19' },
                { pv: 'fake:motor20', name: 'Motor 20' },
                { pv: 'fake:motor21', name: 'Motor 21' },
                { pv: 'fake:motor22', name: 'Motor 22' }
            ]
        },
        {
            heading: 'Cameras',
            icon: <Camera size={24} />,
            pvs: [
                { pv: 'fake:camera1', name: 'Camera 1' },
                { pv: 'fake:camera2', name: 'Camera 2' }
            ]
        },
        {
            heading: 'Signals',
            icon: <Thermometer size={24} />,
            pvs: [
                { pv: 'fake:temp1', name: 'Temperature 1' },
                { pv: 'fake:temp2', name: 'Temperature 2' },
                { pv: 'fake:pressure1', name: 'Pressure Sensor' }
            ]
        },
        {
            heading: 'Detectors',
            icon: <Atom size={24} />,
            pvs: [
                { pv: 'fake:detector1', name: 'Main Detector' },
                { pv: 'fake:detector2', name: 'Reference Det' }
            ]
        }
    ];
    return (
        <div className="h-full w-full space-y-4">
            {/* Synoptic Section - Full Width at Top */}
            <Paper className="w-full p-4 h-fit">
                <div className="mb-2">
                    <h2 className="text-xl font-semibold text-blue-800">Beamline Synoptic</h2>
                    <p className="text-blue-600 text-sm">Live device status and values - single horizontal row with scrolling</p>
                </div>
                <Synoptic devices={synopticDevices} allowWrap={false} />
            </Paper>

            {/* Bottom Section - Two Columns */}
            <div className="flex gap-4 h-[calc(100vh-18rem)]">
                {/* Left Column */}
                <div className="flex-1 flex flex-col">
                    {/* Detector Live View */}
                    <Paper className="flex-1">
                        <div className="h-full flex items-center justify-center bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-dashed border-green-200">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-green-800 mb-2">Detector Live View</h2>
                                <p className="text-green-600 text-sm">Real-time detector images and data</p>
                            </div>
                        </div>
                    </Paper>
                </div>

                {/* Right Column */}
                <div className="flex-1 flex flex-col space-y-4">
                    {/* All Devices */}
                    <Paper className="flex-1" title="All Devices">
                        <div className="h-[calc(100%-4rem)] w-[calc(100%-4rem)] mx-auto">
                            <TablePV columns={tablePVColumns} maxColumnHeight="calc(100% - 40px)" className=""/>
                        </div>
                    </Paper>

                    {/* Strip Charts / Scan */}
                    <Paper className="flex-1">
                        <div className="h-full flex items-center justify-center bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-2 border-dashed border-purple-200">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-purple-800 mb-2">Strip Charts / Scan</h2>
                                <p className="text-purple-600 text-sm">Time series data and scan progress</p>
                            </div>
                        </div>
                    </Paper>
                </div>
            </div>
        </div>
    );
}
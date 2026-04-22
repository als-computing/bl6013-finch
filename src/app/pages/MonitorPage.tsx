import Paper from "@/components/Paper";
import Bento from "@/components/Bento";
import Synoptic, { SynopticDevice } from "@/components/Synoptic";
import TablePV, { TableColumn } from "@/components/TablePV";
import CameraContainer from "@/components/Camera/CameraContainer";
import MultiCameraSelect from "@/features/MultiCameraSelect";
import ScanOrStripchart from "@/features/ScanOrStripchart/ScanOrStripchart";
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
            name: 'Fake Device',
            icon: <Circle size={24} />,
            group: 'Test',
            pvs: [
                { pv: 'fakePV', nickname: 'Test Motor' }
            ]
        },
        {
            name: 'BL6.0.1.3 Beamline',
            icon: <Atom size={24} />,
            group: 'Beamline',
            isBeamline: true,
            pvs: [
                { pv: 'IOC:beam_current', nickname: 'Beam Current' },
                { pv: 'IOC:beam_energy', nickname: 'Energy' },
                { pv: 'IOC:beam_status', nickname: 'Status' },
                { pv: 'IOC:shutter_state', nickname: 'Shutter' }
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
       <Bento>
            {/* Synoptic Section - Full Width at Top */}
            <Paper className="w-full h-fit text-slate-700 bg-sky-950">
                <Synoptic devices={synopticDevices} allowWrap={true} />
            </Paper>

            {/* Bottom Section - Large Screen = 2 columns, Small Screen = 1 column */}
            <div className="flex flex-col xl:flex-row  w-full gap-8">

                {/*Left Column */}
                <div className="w-full xl:w-1/2 flex flex-col h-fit gap-8">
                    {/* All Devices */}
             
                        <div className="h-[calc(100%-4rem)] w-[calc(100%-4rem)] mx-auto flex flex-col">
                            <TablePV columns={tablePVColumns} maxColumnHeight="calc(100% - 30px)" className=""/>
                        </div>
               

                    {/* Strip Charts / Scan */}
                    <Paper className="flex-1 min-h-fit w-full text-slate-700">
                        <ScanOrStripchart 
                            motorPVs={['IOC:m1', 'IOC:m2', 'IOC:m3', 'IOC:m4', 'IOC:m5']}
                            signalPVs={['IOC:m6', 'IOC:m7', 'IOC:m8']}
                            motorOphydNames={['sim_motor']}
                            signalOphydNames={['sim_m1', 'sim_m2', 'sim_m3']}
                        />
                    </Paper>
                </div>

                {/* Right Column */}
                <div className="w-full xl:w-fit h-fit">
                    {/* Detector Live View */}
                    <div className="flex flex-col items-center justify-start min-h-[40rem] h-fit bg-sky-950 w-fit px-8 pb-4 rounded-md">
                        <MultiCameraSelect detectors={[{ prefix: '13SIM1', nickname: 'Sim Detector' }, { prefix: 'fake:detector2', nickname: 'Reference Det' }]}/>
                    </div>
                </div>
            </div>
       </Bento>
       
    );
}
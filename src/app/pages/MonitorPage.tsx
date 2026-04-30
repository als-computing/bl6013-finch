import Paper from "@/components/Paper";
import Bento from "@/components/Bento";
import Synoptic, { SynopticDevice } from "@/components/Synoptic";
import TablePV, { TableColumn } from "@/components/TablePV";
import CameraContainer from "@/components/Camera/CameraContainer";
import MultiCameraSelect from "@/features/MultiCameraSelect";
import ScanOrStripchart from "@/features/ScanOrStripchart/ScanOrStripchart";
import { Gear, Circle, ArrowsClockwise, Atom, Camera, Thermometer, SecurityCamera, Table, LineSegments } from "@phosphor-icons/react";
import pvConfig from "@/config/bl6013PVs.json";

const pvMapToRows = (pvMap: Record<string, string>) =>
    Object.entries(pvMap).map(([name, pv]) => ({ pv, name }));

const { motor, signal, detector, camera } = pvConfig.hirrixs;

const tablePVColumns: TableColumn[] = [
    { heading: 'Motors',    icon: <Gear size={24} />,        pvs: pvMapToRows(motor) },
    { heading: 'Signals',   icon: <Thermometer size={24} />, pvs: pvMapToRows(signal) },
    { heading: 'Detectors', icon: <Atom size={24} />,        pvs: pvMapToRows(detector) },
    { heading: 'Cameras',   icon: <Camera size={24} />,      pvs: pvMapToRows(camera) },
];

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

    return (
       <Bento className="pb-8">
            {/* Synoptic Section - Full Width at Top */}
            <Paper className="w-full h-fit text-slate-700 bg-sky-950 flex flex-col">
                <span className="flex items-center justify-center w-full gap-4 p-4 text-white">
                    <LineSegments size={24} />
                    <p>Beamline Synoptic</p>
                </span>
                <Synoptic devices={synopticDevices} allowWrap={true} />
            </Paper>

            <div className="flex flex-wrap gap-6 w-full">
                <div className="max-w-full flex flex-col bg-sky-950 rounded-md">
                    <span className="flex items-center justify-center w-full gap-4 pt-4">
                        <Table size={24} />
                        <p>All Devices</p>
                    </span>
                    <TablePV columns={tablePVColumns} maxColumnHeight="calc(100% - 30px)" className=""/>
                </div>
        
                {/* Detector Live View */}
                <div className="flex flex-col items-center justify-start min-h-[40rem] h-fit bg-sky-950 w-fit px-8 pb-4 rounded-md">
                    <span className="flex items-center justify-center w-full gap-4 pt-4">
                        <SecurityCamera size={24} />
                           <p>Camera Live View</p>
                    </span>
                    <MultiCameraSelect detectors={[{ prefix: '13SIM1', nickname: 'Sim Detector' }, { prefix: 'fake:detector2', nickname: 'Reference Det' }]}/>
                </div>
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
       </Bento>
    );
}

//  {/* Bottom Section - Large Screen = 2 columns, Small Screen = 1 column */}
//             <div className="flex flex-col xl:flex-row  w-full gap-8">

//                 {/*Left Column */}
//                 <div className="w-full xl:w-1/2 flex flex-col h-fit gap-8">
//                     {/* All Devices */}
             
//                         <div className="h-[calc(100%-4rem)] w-[calc(100%-4rem)] mx-auto flex flex-col">
//                             <TablePV columns={tablePVColumns} maxColumnHeight="calc(100% - 30px)" className=""/>
//                         </div>
               

//                     {/* Strip Charts / Scan */}
//                     <Paper className="flex-1 min-h-fit w-full text-slate-700">
//                         <ScanOrStripchart 
//                             motorPVs={['IOC:m1', 'IOC:m2', 'IOC:m3', 'IOC:m4', 'IOC:m5']}
//                             signalPVs={['IOC:m6', 'IOC:m7', 'IOC:m8']}
//                             motorOphydNames={['sim_motor']}
//                             signalOphydNames={['sim_m1', 'sim_m2', 'sim_m3']}
//                         />
//                     </Paper>
//                 </div>

//                 {/* Right Column */}
//                 <div className="w-full xl:w-fit h-fit">
//                     {/* Detector Live View */}
//                     <div className="flex flex-col items-center justify-start min-h-[40rem] h-fit bg-sky-950 w-fit px-8 pb-4 rounded-md">
//                         <MultiCameraSelect detectors={[{ prefix: '13SIM1', nickname: 'Sim Detector' }, { prefix: 'fake:detector2', nickname: 'Reference Det' }]}/>
//                     </div>
//                 </div>
//             </div>
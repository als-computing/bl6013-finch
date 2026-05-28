import Paper from "@/components/Paper";
import Bento from "@/components/Bento";
import Synoptic, { SynopticDevice } from "@/components/Synoptic";
import TablePV, { TableColumn } from "@/components/TablePV";
import CameraContainer from "@/components/Camera/CameraContainer";
import MultiCameraSelect from "@/features/MultiCameraSelect";
import ScanOrStripchart from "@/features/ScanOrStripchart/ScanOrStripchart";
import { Gear, Circle, ArrowsClockwise, Atom, Camera, Thermometer, SecurityCamera, Table, LineSegments } from "@phosphor-icons/react";
import pvConfig from "@/config/bl6013PVs.json";
import synopConfig from "@/config/amber.json";

const pvMapToRows = (pvMap: Record<string, string>) =>
    Object.entries(pvMap).map(([name, pv]) => ({ pv, name }));

const { motor, signal, detector, camera } = pvConfig.hirrixs;
const { amber } = synopConfig;

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
            name: 'IVID',
            icon: <Atom size={24} />,
            subtitle: 'Undulator',
            pvs: [
                { pv: amber.motor.IVID.Gap, nickname: 'Gap' },
                { pv: amber.motor.IVID.GapReq, nickname: 'Gap Req' },
            ]
        },
        {
            name: 'M101',
            icon: <Circle size={24} />,
            subtitle: 'H-Mirror',
            pvs: [
                { pv: amber.motor.M101.M101Pitch, nickname: 'Pitch' },
                { pv: amber.motor.M101.M101Roll, nickname: 'Roll' }
            ]
        },
        {
            name: 'DIAG101',
            icon: <Gear size={24} />,
            subtitle: '',
            pvs: [
                { pv: amber.motor.DIAG101, nickname: 'Pos' }
            ]
        },
        {
            name: 'Mono',
            icon: <Gear size={24} />,
            subtitle: 'M102+G10x',
            pvs: [
                { pv: amber.motor.M102, nickname: 'M102' },
                { pv: amber.motor.G10x, nickname: 'G10x' },
                { pv: amber.motor.MonoEnergy, nickname: 'Energy' }
            ]
        },
        {
            name: 'M131',
            icon: <ArrowsClockwise size={24} />,
            subtitle: 'H-Mirror',
            pvs: [
                { pv: amber.motor.M131.M131Pitch, nickname: 'Pitch' },
                { pv: amber.motor.M131.M131Roll, nickname: 'Roll' }
            ]
        },
        {
            name: 'SLIT131',
            icon: <Circle size={24} />,
            subtitle: 'Exit Slit',
            pvs: [
                { pv: amber.motor.SLIT, nickname: 'V-Size' }
            ]
        },
        {
            name: 'SHTR131',
            icon: <Circle size={24} />,
            subtitle: 'Shutter',
            pvs: [
                { pv: amber.motor.SHTR131.SHTR131Pos, nickname: 'Pos' },
                { pv: amber.motor.SHTR131.SHTR131PZT, nickname: 'PZT' }
            ]
        },
        {
            name: 'DIAG132',
            icon: <Circle size={24} />,
            subtitle: 'DIAG132',
            pvs: [
                { pv: amber.motor.DIAG132, nickname: 'Pos' }
            ]
        },
        {
            name: 'AP131',
            icon: <Circle size={24} />,
            subtitle: 'H-Aperture',
            pvs: [
                { pv: amber.motor.AP131.AP131Pos, nickname: 'Pos' },
                { pv: amber.motor.AP131.AP131Size, nickname: 'Size' }
            ]
        },
        {
            name: 'AP132',
            icon: <Circle size={24} />,
            subtitle: 'V-Aperture',
            pvs: [
                { pv: amber.motor.AP132.AP132Pos, nickname: 'Pos' },
                { pv: amber.motor.AP132.AP132Size, nickname: 'Size' }
            ]
        },
        {
            name: 'M132',
            icon: <Circle size={24} />,
            subtitle: 'H-Mirror',
            pvs: [
                { pv: amber.motor.M132, nickname: 'Pitch' }
            ]
        },
        {
            name: 'M133',
            icon: <Circle size={24} />,
            subtitle: 'V-Mirror',
            pvs: [
                { pv: amber.motor.M133, nickname: 'Pitch' }
            ]
        },
        {
            name: 'DIAG133',
            icon: <Circle size={24} />,
            subtitle: '',
            pvs: [
                { pv: amber.motor.DIAG133, nickname: 'Pos' }
            ]
        },
        {
            name: 'DIAG134',
            icon: <Circle size={24} />,
            subtitle: '',
            pvs: [
                { pv: amber.motor.DIAG134, nickname: 'Pos' }
            ]
        },
        {
            name: 'HiRRIXS Endstation',
            icon: <Atom size={24} />,
            subtitle: '',
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
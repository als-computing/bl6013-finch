import { endstation } from "@/assets/bl6013Icons";
import { Robot } from "@phosphor-icons/react";

export interface MotorConfig {
    /** Display label shown in the selector and controller. */
    label: string;
    /** Primary EPICS PV name (setpoint). */
    pv: string;
    /** Optional SVG icon rendered in the DeviceControllerBox header. */
    svgIcon?: React.ReactNode;
}

const motors: MotorConfig[] = [
    { label: "Main Manip X",         pv: "BL6013:MainManipX",           svgIcon: endstation.sample },
    { label: "Main Manip Y",         pv: "BL6013:MainManipY",           svgIcon: endstation.sample },
    { label: "Main Manip Z",         pv: "BL6013:MainManipZ",           svgIcon: endstation.sample },
    { label: "Main Manip Theta",     pv: "BL6013:MainManiptheta",       svgIcon: endstation.sample },
    { label: "Mirror Angle",         pv: "BL6013:MirrorAngle",          svgIcon: endstation.mirror },
    { label: "Grating Angle",        pv: "BL6013:GratingAnglealpha",    svgIcon: endstation.grating },
    { label: "Detector X",          pv: "BL6013:DetectorX",            svgIcon: endstation.detector },
    { label: "Detector Z",          pv: "BL6013:DetectorZ",            svgIcon: endstation.detector },
    { label: "Spect Optics Pitch",   pv: "BL6013:SpectOpticsPitch",     svgIcon: endstation.optics },
    { label: "Spect Optics Roll",    pv: "BL6013:SpectOpticsRoll",      svgIcon: endstation.optics },
    { label: "Spect Optics Height",  pv: "BL6013:SpectOpticsHeight",    svgIcon: endstation.optics },
    { label: "Microscope X",         pv: "BL6013:MicroscopeX",          svgIcon: endstation.microscope },
    { label: "Microscope Y",         pv: "BL6013:MicroscopeY",          svgIcon: endstation.microscope },
    { label: "Microscope Z",         pv: "BL6013:MicroscopeZ",          svgIcon: endstation.microscope },
    { label: "Fake Motor",           pv: "BL6013:FakeMotor",            svgIcon: <Robot size={64} /> },
];

export default motors;

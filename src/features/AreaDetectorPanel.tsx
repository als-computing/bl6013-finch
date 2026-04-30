import { useState } from "react";
import CameraContainer, { CameraContainerProps } from "@/components/Camera/CameraContainer";
import ReactEDM from "@/components/ReactEDM/ReactEDM";
import { CaretDown, CaretUp } from "@phosphor-icons/react";

interface AreaDetectorPanelProps extends Omit<CameraContainerProps, "enableSettings"> {
    /** Display label shown above the detector. Defaults to the prefix value. */
    label?: string;
    /** When true, suppresses rendering the label heading. */
    hideLabel?: boolean;
    /** ADL or BOB file name to load in the MEDM panel (e.g. `'ADBase.adl'`). */
    edmFileName: string;
    /** EPICS cam record suffix passed as `R` to ReactEDM. Defaults to `'cam1'`. */
    edmR?: string;
    /** Additional CSS classes for the outer container. */
    className?: string;
}

export default function AreaDetectorPanel({
    label,
    hideLabel = false,
    prefix,
    edmFileName,
    edmR = "cam1",
    className,
    ...cameraProps
}: AreaDetectorPanelProps) {
    const [showMedm, setShowMedm] = useState(false);

    return (
        <div className={`flex flex-col gap-3 h-fit ${className ?? ""}`}>
            {!hideLabel && <h3 className="text-sm font-semibold uppercase tracking-wide">{label ?? prefix}</h3>}

            <CameraContainer prefix={prefix} enableSettings={false} {...cameraProps} />

            <button
                onClick={() => setShowMedm((prev) => !prev)}
                className="flex items-center gap-1 self-start text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
                {showMedm ? <CaretUp size={12} /> : <CaretDown size={12} />}
                MEDM Panel
            </button>

            {showMedm && (
                <ReactEDM P={prefix} R={edmR} fileName={edmFileName} />
            )}
        </div>
    );
}

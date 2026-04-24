import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import TableDeviceController, { TableDeviceControllerProps } from './TableDeviceController';

export type TablePVControllerProps = {
    /** Array of PV names to connect to and display in the table */
    pvs: string[];
} & Omit<TableDeviceControllerProps, 'devices' | 'handleSetValueRequest' | 'toggleDeviceLock' | 'toggleExpand'>;

export default function TablePVController({ pvs, ...tableProps }: TablePVControllerProps) {
    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } = useOphydPVSocket(pvs);

    return (
        <TableDeviceController
            devices={devices}
            handleSetValueRequest={handleSetValueRequest}
            toggleDeviceLock={toggleDeviceLock}
            toggleExpand={toggleExpand}
            {...tableProps}
        />
    );
}

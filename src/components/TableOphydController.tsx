import useOphydDeviceSocket from '@/api/ophyd/useOphydDeviceSocket';
import TableDeviceController, { TableDeviceControllerProps } from './TableDeviceController';

export type TableOphydControllerProps = {
    /** Array of Ophyd device names to connect to and display in the table */
    ophydNames: string[];
} & Omit<TableDeviceControllerProps, 'devices' | 'handleSetValueRequest' | 'toggleDeviceLock' | 'toggleExpand'>;

export default function TableOphydController({ ophydNames, ...tableProps }: TableOphydControllerProps) {
    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } = useOphydDeviceSocket(ophydNames);

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

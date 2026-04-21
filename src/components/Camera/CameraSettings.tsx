import { Devices } from '@/types/deviceControllerTypes';
import InputGroup from './InputGroup';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type CameraSettingsProps = {
    /** When `false`, the settings panel is hidden entirely. Defaults to `true`. */
    enableSettings?: boolean;
    /** Array of grouped detector settings, each describing a title, PV sub-prefix, and a list of inputs. */
    settings: {
        title: string;
        prefix: string | null;
        inputs: {
            suffix: string;
            label: string;
            type: 'enum' | 'float' | 'integer' | 'string' | 'boolean';
            min?: number;
            max?: number;
            enums?: string[];
        }[]
    }[];
    /** EPICS PV prefix prepended to each input suffix when constructing full PV names. */
    prefix?: string;
    /** Map of full PV names to their live device objects, used to display current values and connection state. */
    cameraSettingsPVs: Devices;
    /** Callback invoked when the user submits a new value for a PV. Receives the full PV name and new value. */
    onSubmit?: (pv:string, value:string | boolean | number) => void;
    /** Additional Tailwind class names applied to the settings panel container. */
    styles?: string;
}
export default function CameraSettings({enableSettings=true, settings=[], prefix='13SIM1:cam1', cameraSettingsPVs={}, onSubmit=()=>{}, styles}: CameraSettingsProps) {
    const [selectedTab, setSelectedTab] = useState<string>(settings.length > 0 ? settings[0].title : '');
    
    if (enableSettings) {
        const selectedGroup = settings.find(group => group.title === selectedTab);
        
        return (
            <section className={cn("w-full h-full min-w-[30rem] px-4 py-2 flex flex-col flex-grow", styles)}>
                {/* Tab Headers */}
                <div className="flex space-x-6 mb-4 flex-shrink-0">
                    {settings.map((group) => (
                        <button
                            key={group.title}
                            onClick={() => setSelectedTab(group.title)}
                            className={cn(
                                "pb-2 px-1 transition-colors duration-200 hover:text-white",
                                selectedTab === group.title 
                                    ? "text-white border-b-2 border-white" 
                                    : "text-gray-400 text-base"
                            )}
                        >
                            {group.title}
                        </button>
                    ))}
                </div>
                
                {/* Selected Tab Content */}
                <div className="">
                    {selectedGroup && (
                        <InputGroup 
                            key={selectedGroup.title} 
                            settingsGroup={selectedGroup} 
                            prefix={prefix} 
                            cameraSettingsPVs={cameraSettingsPVs} 
                            onSubmit={onSubmit}
                            hideTitle={true}
                        />
                    )}
                </div>
            </section>
        )
    } else {
        return <></>
    }
}
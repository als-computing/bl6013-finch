import { useState, useRef, useEffect } from 'react';
import { tailwindIcons } from '@/assets/icons';

type InputEnumProps = {
    /** Display label shown to the left of the dropdown. */
    label?: string;
    /** List of string options to display in the dropdown. */
    enums?: string[];
    /** Callback invoked with the selected string when the user picks an option. */
    onSubmit?: (input: string) => void;
    /** When `true`, prevents interaction and renders the control in a disabled style. */
    isDisabled?: boolean;
};

export default function InputEnum ({label='label', enums=['blank1','blank2'], onSubmit=(input) => console.log('submit: ' + input), isDisabled=false}: InputEnumProps) {
    const [selectedEnum, setSelectedEnum] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);
   

    const containerRef = useRef<null | HTMLDivElement>(null);

    const handleInputClick = () => {
        if (!isDisabled) setDropdownVisible(!dropdownVisible);
    };

    const handleEnumClick = (item:string) => {
        if (item !== selectedEnum) {
            setSelectedEnum(item);
            onSubmit(item);
        }
        setDropdownVisible(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setDropdownVisible(false);
        }
    };


    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={containerRef} className={`${isDisabled ? 'text-slate-400' : 'text-white'} flex w-full max-w-64 text-lg`}>
            <p className="w-1/2">{`${label} `}</p>
            <div className={`${isDisabled ? 'hover:cursor-not-allowed' : ''} w-1/2 border border-slate-300 rounded-md flex flex-col bg-sky-200 shadow-inner`} onClick={handleInputClick}>
                <div className="flex w-full ">
                    <div className="flex-grow">
                        <p className='pl-2 text-black'>{selectedEnum}</p>
                    </div>
                    <div className="flex-shrink-0 text-black">{dropdownVisible ? tailwindIcons.chevronUp : tailwindIcons.chevronDown}</div>
                </div>
                <span className="relative w-full">
                    {dropdownVisible && (
                        <ul className="text-black z-10 absolute w-full top-0 bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-auto">
                            {enums
                                .map((item) => (
                                    <li
                                        key={item}
                                        onClick={() => handleEnumClick(item)}
                                        className="p-2 cursor-pointer hover:bg-gray-200"
                                    >
                                        {item}
                                    </li>
                                ))}
                        </ul>
                    )}
                </span>
            </div>
        </div>
    );
}
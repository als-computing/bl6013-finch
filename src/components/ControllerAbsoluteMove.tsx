import { useState } from "react";

import { ArrowCircleRight } from "@phosphor-icons/react";
import InputNumber from "./InputNumber";
import Button from "./Button";
import { cn } from "@/lib/utils";

export type ControllerAbsoluteMoveProps = {
    /** Called when the user submits a value via the arrow button or Enter key. Receives the current input value, or null if empty. */
    handleEnter?: (input: number | null) => void;
    /** Label displayed next to the input (e.g. units like "mm"). */
    inputLabel?: string;
    /** Additional CSS classes applied to the inner input element. */
    classNameInput?: string;
    /** Additional CSS classes applied to the root wrapper element. */
    className?: string;
    /** Disables interaction and applies dimmed styling when true. */
    locked?: boolean;
    /** Whether to display the units label next to the input. Defaults to true. */
    showLabel?: boolean;
}

export default function ControllerAbsoluteMove({handleEnter, inputLabel, classNameInput, className, locked, showLabel = true, ...props}: ControllerAbsoluteMoveProps) {
    const [ inputValue, setInputValue ] = useState<number | null>(null);
return (
    <div 
        className={cn(
            "flex items-center space-x-2",
            locked ? "pointer-events-none opacity-50 hover:cursor-not-allowed" : "",
            className
        )}
        {...props}
    >
        <InputNumber disabled={locked} label={showLabel ? inputLabel : undefined} labelPosition='right' className={cn(`${showLabel ? 'w-32' : 'w-24'}`)} handleEnter={handleEnter} onChange={(input) => setInputValue(input)} classNameInput={cn("text-right", classNameInput)}/>
        <Button disabled={locked} text="Set" size="small" onClick={()=>handleEnter && handleEnter(inputValue)} />
    </div>
)
}
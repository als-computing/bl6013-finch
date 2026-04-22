import { useState, useRef, useEffect } from 'react';
import { WidgetStyleProps } from './Widget';
import { useOphydApiUrls } from 'src/utils/apiUtils';
import './styles/qserver.css';
import '../style.css';
import { cn } from '@/lib/utils';

import dayjs from 'dayjs';

//import ToggleSlider from '../library/ToggleSlider'; //to do  - see if this can be refactored to include the functionality for turning off if connection fails
type ConsoleMessage = {
    mainText: string;
    bracketText: string;
    time: string;
    id: number;
};

type QSConsoleProps = WidgetStyleProps & {
    processConsoleMessage: (message: string) => void;
    /** Whether to use dark mode styling (default: false for light mode) */
    darkMode?: boolean;
    /** Style applied to each row containing console message */
    classNameTextRow?: string;
    /** Hide the timestamp at the right of each console message */
    hideTimestamp?: boolean;
    
    // Theme override props - these take precedence over dark/light mode defaults
    /** Main container background */
    classNameMainBg?: string;
    /** Toggle OFF text color */
    classNameToggleOffText?: string;
    /** Toggle ON text color */
    classNameToggleOnText?: string;
    /** Toggle inactive text color */
    classNameToggleInactiveText?: string;
    /** Status message text color */
    classNameStatusText?: string;
    /** Toggle switch active background */
    classNameToggleActiveBg?: string;
    /** Toggle switch inactive background */
    classNameToggleInactiveBg?: string;
    /** Toggle switch knob background */
    classNameToggleKnobBg?: string;
    /** Connection status text color */
    classNameConnectionText?: string;
    /** Waiting message text color */
    classNameWaitingText?: string;
    /** Console message text color */
    classNameMessageText?: string;
    /** Message number text color */
    classNameMessageNumberText?: string;
    /** Timestamp text color */
    classNameTimestampText?: string;
}
export default function QSConsole({ 
    processConsoleMessage = () => {}, 
    darkMode = true, 
    classNameTextRow, 
    hideTimestamp = false,
    // Theme override props
    classNameMainBg,
    classNameToggleOffText,
    classNameToggleOnText,
    classNameToggleInactiveText,
    classNameStatusText,
    classNameToggleActiveBg,
    classNameToggleInactiveBg,
    classNameToggleKnobBg,
    classNameConnectionText,
    classNameWaitingText,
    classNameMessageText,
    classNameMessageNumberText,
    classNameTimestampText
}: QSConsoleProps) {

    // Color theme variables - props override dark/light mode defaults
    const theme = {
        // Main container
        mainBg: classNameMainBg || (darkMode ? 'bg-black' : 'bg-white'),
        
        // Toggle switch and status
        toggleOffText: classNameToggleOffText || (darkMode ? 'text-gray-300' : 'text-gray-800'),
        toggleOnText: classNameToggleOnText || (darkMode ? 'text-green-400' : 'text-green-600'),
        toggleInactiveText: classNameToggleInactiveText || (darkMode ? 'text-gray-500' : 'text-gray-400'),
        statusText: classNameStatusText || (darkMode ? 'text-gray-300' : 'text-slate-500'),
        
        // Toggle switch background
        toggleActiveBg: classNameToggleActiveBg || (darkMode ? 'bg-green-500' : 'bg-green-600'),
        toggleInactiveBg: classNameToggleInactiveBg || 'bg-gray-300',
        toggleKnobBg: classNameToggleKnobBg || 'bg-white',
        
        // Console messages
        connectionText: classNameConnectionText || (darkMode ? 'text-gray-300' : 'text-slate-400'),
        waitingText: classNameWaitingText || (darkMode ? 'text-gray-400' : 'text-white'),
        messageText: classNameMessageText || (darkMode ? 'text-gray-200' : 'text-slate-600'),
        messageNumberText: classNameMessageNumberText || (darkMode ? 'text-gray-400' : 'text-slate-500'),
        timestampText: classNameTimestampText || (darkMode ? 'text-blue-400' : 'text-sky-600'),
    };

    
    const [ wsMessages, setWsMessages ] = useState<ConsoleMessage[]>([]); //text for the websocket output
    const [ isOpened, setIsOpened ] = useState(false); //boolean representing status of WS connection
    const [ statusMessage, setStatusMessage ] = useState<string>('');
    const [isToggleOn, setIsToggleOn] = useState(false); //toggle UI switch for turning output on and off
    const connection = useRef<WebSocket | null>(null); //queue server WS via FastAPI
    const { getWsUrl } = useOphydApiUrls();
    const wsUrl = getWsUrl('qs-console-socket'); //this comes from the ophyd api, not the queue server.
    const messageContainerRef = useRef<HTMLDivElement | null>(null);
    const hasErrorOccuredRef = useRef(false);
    const didUserTurnOffWS = useRef(false);

    const toggleSwitch = () => {
        if (isToggleOn) {
            handleCloseWS();
        } else {
            handleOpenWS();
        }
        setIsToggleOn(!isToggleOn);
    };

    const handleWebSocketMessage = (event: MessageEvent) => {
        //console.log('received message from ws');
        //this function receives the websocket message and displays it to the client
        const eventData = JSON.parse(event.data) as Record<string, string>;
        //console.log({eventData});
        if ("msg" in eventData) {

            //update the console with the messages, add new message to existing
            setWsMessages((messages) => { 
                //console.log({messages});
                if (eventData.msg === "\n") return messages;

                let id = 0;
                if (messages.length > 0) id = messages.length;
                let timeStamp;
                if ("time" in eventData) {
                    timeStamp = dayjs.unix(parseFloat(eventData.time)).format('hh:mm:ss::SSS a'); 
                } else {
                    timeStamp = dayjs().format('hh:mm:ss::SSS a');
                }

                //process the message, sometimes it contains "[ date and service ] ...." at the 
                //start of the message which becomes difficult to read
                let bracketText = '';
                let mainText = '';
                if (eventData.msg.startsWith('[')) {
                    const closingBracketIndex = eventData.msg.indexOf(']');
                    bracketText = eventData.msg.slice(0, closingBracketIndex + 1); 
                    mainText = eventData.msg.slice(closingBracketIndex + 1);
                } else {
                    if (eventData.msg !== '\n') {
                        mainText = eventData.msg;
                    }
                }
                //console.log({bracketText});
                //console.log({mainText});
                processConsoleMessage(mainText.trim()); //check keywords, update other React state if matches found
                const newMessage = {mainText: mainText, bracketText: bracketText, time: timeStamp, id: id};
            
          
                return [...messages, newMessage];
            })
        }
    }

    const closeWebSocket = (connection:React.MutableRefObject<WebSocket | null>) => {
        if (connection.current !== null) {
            try {
                console.log("Attempting to close existing connection");
                connection.current.close();
                console.log("Existing websocket connection closed");
                setStatusMessage("Closed connection " + dayjs().format('HH:MM A'));
            } catch (error) {
                console.log("Unable to properly close existing websocket connection, still setting connection.current=null")
                console.log({error});
                setStatusMessage("Encountered error on closing websocket, forcefully removed connection at " + dayjs().format('HH:MM A'));
            }
            connection.current = null;
        } else {
            console.log("connection.current is null, removing websocket skipped");
        }
    }

    const initializeConnection = (wsUrl:string, connection:React.MutableRefObject<WebSocket | null>, _isOpened:boolean) => {
        //Ensure wsUrl is not empty
        if (wsUrl === '') {
            return;
        }
    
        closeWebSocket(connection);
    

        const socket = new WebSocket(wsUrl);

        setStatusMessage("Attempting WS Connection");

        
        socket.addEventListener("error", error => {
            alert("Unable to establish connection to WS, check that the WS server is running and that the path/port are correct");
            setStatusMessage("Last connection attempt to websocket failed at " + dayjs().format('HH:MM A'))
            setIsToggleOn(false);
            console.log({error});
            hasErrorOccuredRef.current = true;
        });

    
        //if websocket opens, add event listener for messages
        socket.addEventListener("open", _event => {
            setIsOpened(true);
            console.log("Opened connection in socket to: " + wsUrl);
            setStatusMessage("Opened connection " + dayjs().format('hh:mm A'));
            socket.addEventListener("message", handleWebSocketMessage);
            connection.current = socket;
        });

        //if websocket closes, attempt to reconnect & display a message
        socket.addEventListener("close", _event => {
            console.log('ws connection to fastapi server closed');
            setIsToggleOn(false);
            if (hasErrorOccuredRef.current === true) {
                //Either the fastAPI server stopped running, or the initial connection attempt failed
                //reset the ref
                hasErrorOccuredRef.current = false;
                setStatusMessage("Error occured during connection attempt at  " + dayjs().format('hh:MM A'));
            } else {
                //no error has occured, so the connection closed from user input or due to computer sleeping
                if (didUserTurnOffWS.current === false) {
                    //computer fell asleep
                    //attempt to reconnect WS
                    handleOpenWS();
                    setIsToggleOn(true);
                } else {
                    setStatusMessage("Manually disconnected from websocket at " + dayjs().format('hh:MM A'));
                    //user turned off ws
                    //reset the ref
                    didUserTurnOffWS.current = false;
                }
            }
        })
    }

    const handleOpenWS = () => {
        initializeConnection(wsUrl, connection, isOpened)
    }

    const handleCloseWS = () => {
        didUserTurnOffWS.current = true;
        closeWebSocket(connection);
        setIsOpened(false);
    }

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [wsMessages]);

    useEffect(() => {
        toggleSwitch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className={`h-full rounded-lg relative ${theme.mainBg}`}>
            {/* Toggle Switch & Status Header */}
            <div  className="flex items-start justify-start space-x-12 pl-12 pt-1 absolute top-0 z-10 rounded-t-lg">
                <div className="flex w-fit items-center space-x-2">
                    <p className={isToggleOn ? theme.toggleInactiveText : theme.toggleOffText}>OFF</p>
                    <button
                        onClick={toggleSwitch}
                        className={`w-16 h-5 flex items-center rounded-full px-1 cursor-pointer ${
                            isToggleOn ? theme.toggleActiveBg : theme.toggleInactiveBg
                        }`}
                        >
                        <div
                            className={`${theme.toggleKnobBg} w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                                isToggleOn ? 'translate-x-10' : 'translate-x-0'
                            }`}
                        ></div>
                    </button>
                    <p className={isToggleOn ? theme.toggleOnText : theme.toggleInactiveText}>ON</p>
                </div>
                <p className={theme.statusText}>{statusMessage}</p>
            </div>
            {/* Main Body */}
            <div className="h-full w-full absolute top-0 pt-8">
                <section ref={messageContainerRef} className="overflow-auto h-full w-full rounded-b-lg scrollbar-always-visible transparent-scrollbar" >
                    {isOpened ? <p className={`${theme.connectionText} pl-4`}>Connection Opened. Listening for Queue Server console output.</p> : <p className={`animate-pulse ${theme.waitingText} pl-4`}>Waiting for initialization...</p>}
                    <ul className="flex flex-col">
                        {wsMessages.map((msg) => {
                            return (
                                <li key={msg.id} className={cn(`w-full flex ${theme.messageText}`, classNameTextRow)}>
                                    <p className={`w-fit text-center flex-shrink-0 pl-2 pr-4 ${theme.messageNumberText}`}> {msg.id} </p>
                                    <p className="flex-grow">{msg.mainText}</p>
                                    {!hideTimestamp && <p className={`w-fit flex-shrink-0 pr-2 ${theme.timestampText} text-center`}>{msg.time}</p>}
                                </li>
                            )
                        })}
                    </ul>
                </section>
            </div>
        </main>
    )
}
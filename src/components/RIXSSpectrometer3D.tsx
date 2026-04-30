import React, { useState, useRef, useEffect } from 'react';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import sampleDevices from '@/config/bl6013PVs.json';
import { endstation } from '@/assets/bl6013Icons';
import { cn } from '@/lib/utils';

interface EndstationViewerProps {
  className?: string;
  onDeviceClick?: (deviceName: string, motors: string[], icon?: React.ReactNode) => void;
  hideControls?: boolean;
  alwaysShowRegionLabels?: boolean;
  hideRegionOverlays?: boolean;
  regionClassName?: string;
  regionLabelClassName?: string;
}

// Region definitions matching the Python implementation (x, y, w, h) - adjusted for 439px crop from top
// const REGIONS = [
//   { name: "Sample", x: 300, y: 249, w: 200, h: 70, motors: ["MainManipX", "MainManipY", "MainManipZ", "MainManiptheta"], icon: endstation.sample }, // 688-439
//   { name: "Microscope", x: 495, y: 51, w: 275, h: 160, motors: ["MicroscopeX", "MicroscopeY", "MicroscopeZ"], icon: endstation.microscope }, // 490-439
//   { name: "Mirror", x: 1230, y: 201, w: 470, h: 275, motors: ["MirrorAngle"], icon: endstation.mirror }, // 640-439
//   { name: "Optics", x: 1260, y: 476, w: 550, h: 160, motors: ["SpectOpticsHeight", "SpectOpticsPitch", "SpectOpticsRoll"], icon: endstation.optics }, // 915-439
//   { name: "Grating", x: 1560, y: 51, w: 555, h: 200, motors: ["GratingAngle"], icon: endstation.grating }, // 490-439
//   { name: "Detector", x: 1890, y: 371, w: 330, h: 260, motors: ["DetectorX", "DetectorZ"], icon: endstation.detector }, // 810-439
// ];
const REGIONS = [
  { name: "Sample", x: 300, y: 249, w: 200, h: 70, motors: ["BL6013:MainManipX", "BL6013:MainManipY", "BL6013:MainManipZ", "BL6013:MainManiptheta"], icon: endstation.sample }, // 688-439
  { name: "Microscope", x: 495, y: 51, w: 275, h: 160, motors: ["BL6013:MicroscopeX", "BL6013:MicroscopeY", "BL6013:MicroscopeZ"], icon: endstation.microscope }, // 490-439
  { name: "Mirror", x: 1230, y: 201, w: 470, h: 275, motors: ["BL6013:MirrorAngle"], icon: endstation.mirror }, // 640-439
  { name: "Optics", x: 1260, y: 476, w: 550, h: 160, motors: ["BL6013:SpectOpticsHeight", "BL6013:SpectOpticsPitch", "BL6013:SpectOpticsRoll"], icon: endstation.optics }, // 915-439
  { name: "Grating", x: 1560, y: 51, w: 555, h: 200, motors: ["BL6013:GratingAngle"], icon: endstation.grating }, // 490-439
  { name: "Detector", x: 1890, y: 371, w: 330, h: 260, motors: ["BL6013:DetectorX", "BL6013:DetectorZ"], icon: endstation.detector }, // 810-439
];

// PV overlays positioned on the image (img_x, img_y, pv_name, label) - adjusted for 439px crop from top
const PV_OVERLAYS = [
  { region: "Mirror", x: 1200, y: 61, pv: "BL6013:MirrorAngle", label: "Mirror Angle" }, // 500-439
  { region: "Grating", x: 2000, y: -89, pv: "BL6013:GratingAnglealpha", label: "Grating Angle" }, // 350-439 (negative, may need adjustment)
  { region: "Optics", x: 1400, y: 811, pv: "BL6013:SpectOpticsHeight", label: "Optics Height" }, // 1250-439
  { region: "Optics", x: 1400, y: 911, pv: "BL6013:SpectOpticsPitch", label: "Optics Pitch" }, // 1350-439 (outside image bounds, may need adjustment)
  { region: "Optics", x: 1400, y: 1011, pv: "BL6013:SpectOpticsRoll", label: "Optics Roll" }, // 1450-439 (outside image bounds, may need adjustment)
  { region: "Detector", x: 2100, y: 761, pv: "BL6013:DetectorX", label: "Detector X" }, // 1200-439
  { region: "Detector", x: 2100, y: 911, pv: "BL6013:DetectorZ", label: "Detector Z" }, // 1350-439 (outside image bounds, may need adjustment)
  { region: "Microscope", x: 250, y: -209, pv: "BL6013:MicroscopeX", label: "Microscope X" }, // 230-439 (negative, may need adjustment)
  { region: "Microscope", x: 250, y: -134, pv: "BL6013:MicroscopeY", label: "Microscope Y" }, // 305-439 (negative, may need adjustment)
  { region: "Microscope", x: 250, y: -59, pv: "BL6013:MicroscopeZ", label: "Microscope Z" }, // 380-439 (negative, may need adjustment)
  { region: "Sample", x: 200, y: 386, pv: "BL6013:MainManipX", label: "Manip X" }, // 825-439
  { region: "Sample", x: 200, y: 461, pv: "BL6013:MainManipY", label: "Manip Y" }, // 900-439
  { region: "Sample", x: 200, y: 536, pv: "BL6013:MainManipZ", label: "Manip Z" }, // 975-439
  { region: "Sample", x: 200, y: 611, pv: "BL6013:MainManiptheta", label: "Manip θ" }, // 1050-439
];

// Original image dimensions (after cropping 439px from top)
const IMG_W = 2222;
const IMG_H = 677; // 1316 - 439 = 877

interface PVOverlayProps {
  x: number;
  y: number;
  label: string;
  pv: string;
  value?: string | number | boolean;
  isConnected: boolean;
  scale: number;
  isRegionHovered: boolean;
  onSetValue: (pv: string, value: string | number | boolean) => void;
}

function PVOverlay({ x, y, label, pv, value, isConnected, scale, isRegionHovered, onSetValue }: PVOverlayProps) {
  const [inputValue, setInputValue] = React.useState('');
  
  const displayValue = value !== undefined 
    ? (typeof value === 'number' ? value.toFixed(6) : String(value))
    : (isConnected ? 'N/A' : 'N/C');

  const handleInputSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputValue.trim()) return;
    
    try {
      const numValue = parseFloat(inputValue);
      onSetValue(pv, numValue);
      setInputValue('');
    } catch (error) {
      console.error('Invalid numeric value:', inputValue);
    }
  };

  return (
    <div
      className={cn(
        "absolute bg-slate-800/90 text-white text-xs border border-yellow-400/60 transition-opacity duration-200 rounded-sm",
        isRegionHovered ? "opacity-100" : "opacity-35"
      )}
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)',
        padding: '6px',
        minWidth: '200px',
      }}
    >
      {/* Single horizontal row with label, value, and input */}
      <div className="flex items-center gap-2">
        {/* Label */}
        <span className="text-yellow-300 font-semibold text-xs whitespace-nowrap">
          {label}:
        </span>
        
        {/* Readback Value */}
        <span 
          className={cn(
            "font-mono text-right min-w-[60px] text-xs",
            isConnected ? "text-green-300" : "text-red-300"
          )}
        >
          {displayValue}
        </span>
        
        {/* Input Field */}
        <form onSubmit={handleInputSubmit} className="flex-shrink-0">
          <input
            type="number"
            step="any"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="setpoint"
            className="bg-white/30 text-white text-xs px-2 py-1 rounded border border-yellow-400/60 focus:border-yellow-400 focus:outline-none placeholder-gray-300"
            style={{ fontSize: '11px', width: '64px' }}
          />
        </form>
      </div>
    </div>
  );
}

export default function EndstationViewer({ 
  className, 
  onDeviceClick, 
  hideControls = false, 
  alwaysShowRegionLabels = false, 
  hideRegionOverlays = false,
  regionClassName,
  regionLabelClassName 
}: EndstationViewerProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Get device data from the sample devices JSON
  const hirrixsDevices = sampleDevices.hirrixs;
  
  // Extract all motor PVs for real-time data
  const motorPVs = Object.values(hirrixsDevices.motor);
  const allPVs = [...motorPVs, ...PV_OVERLAYS.map(o => o.pv)];
  
  // Get live device data and setValue function
  const { devices: ophydDevices, handleSetValueRequest } = useOphydPVSocket(allPVs);

  // Calculate scale factor for responsive sizing
  const scale = imageDimensions.width / IMG_W;

  // Handle mouse events
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!imageLoaded || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageAspectRatio = IMG_W / IMG_H;
    const containerAspectRatio = containerRect.width / containerRect.height;
    
    // Calculate image position within container
    let imageLeft, imageTop, imageWidth, imageHeight;
    
    if (containerAspectRatio > imageAspectRatio) {
      // Container is wider - image centered horizontally
      imageHeight = containerRect.height;
      imageWidth = imageHeight * imageAspectRatio;
      imageLeft = (containerRect.width - imageWidth) / 2;
      imageTop = 0;
    } else {
      // Container is taller - image centered vertically
      imageWidth = containerRect.width;
      imageHeight = imageWidth / imageAspectRatio;
      imageLeft = 0;
      imageTop = (containerRect.height - imageHeight) / 2;
    }

    // Convert mouse coordinates relative to container to image coordinates
    const mouseX = event.clientX - containerRect.left;
    const mouseY = event.clientY - containerRect.top;
    
    // Check if mouse is within image bounds
    if (mouseX < imageLeft || mouseX > imageLeft + imageWidth ||
        mouseY < imageTop || mouseY > imageTop + imageHeight) {
      setHoveredRegion(null);
      return;
    }
    
    // Convert to image pixel coordinates
    const x = ((mouseX - imageLeft) / imageWidth) * IMG_W;
    const y = ((mouseY - imageTop) / imageHeight) * IMG_H;

    // Check if mouse is over any region
    const hitRegion = REGIONS.find(region => 
      x >= region.x && x <= region.x + region.w &&
      y >= region.y && y <= region.y + region.h
    );

    setHoveredRegion(hitRegion ? hitRegion.name : null);
  };

  const handleMouseLeave = () => {
    setHoveredRegion(null);
  };

  const handleClick = (event: React.MouseEvent) => {
    if (!imageLoaded || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageAspectRatio = IMG_W / IMG_H;
    const containerAspectRatio = containerRect.width / containerRect.height;
    
    // Calculate image position within container
    let imageLeft, imageTop, imageWidth, imageHeight;
    
    if (containerAspectRatio > imageAspectRatio) {
      // Container is wider - image centered horizontally
      imageHeight = containerRect.height;
      imageWidth = imageHeight * imageAspectRatio;
      imageLeft = (containerRect.width - imageWidth) / 2;
      imageTop = 0;
    } else {
      // Container is taller - image centered vertically
      imageWidth = containerRect.width;
      imageHeight = imageWidth / imageAspectRatio;
      imageLeft = 0;
      imageTop = (containerRect.height - imageHeight) / 2;
    }

    // Convert mouse coordinates relative to container to image coordinates
    const mouseX = event.clientX - containerRect.left;
    const mouseY = event.clientY - containerRect.top;
    
    // Check if click is within image bounds
    if (mouseX < imageLeft || mouseX > imageLeft + imageWidth ||
        mouseY < imageTop || mouseY > imageTop + imageHeight) {
      return;
    }
    
    // Convert to image pixel coordinates
    const x = ((mouseX - imageLeft) / imageWidth) * IMG_W;
    const y = ((mouseY - imageTop) / imageHeight) * IMG_H;

    // Check if click is on any region
    const hitRegion = REGIONS.find(region => 
      x >= region.x && x <= region.x + region.w &&
      y >= region.y && y <= region.y + region.h
    );

    if (hitRegion) {
      // Toggle selection: if clicking on already selected region, deselect it
      if (selectedRegion === hitRegion.name) {
        setSelectedRegion(null);
      } else {
        // Set selected region (stays highlighted until another region or empty area is clicked)
        setSelectedRegion(hitRegion.name);
        if (onDeviceClick) {
          onDeviceClick(hitRegion.name, hitRegion.motors, hitRegion.icon);
        }
      }
    } else {
      // Clicked on empty area - deselect any selected region
      setSelectedRegion(null);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (imageRef.current && containerRef.current) {
      // Calculate the actual displayed image dimensions
      const containerRect = containerRef.current.getBoundingClientRect();
      const imageAspectRatio = IMG_W / IMG_H;
      const containerAspectRatio = containerRect.width / containerRect.height;
      
      let displayWidth, displayHeight;
      
      if (containerAspectRatio > imageAspectRatio) {
        // Container is wider than image aspect ratio - height constrained
        displayHeight = containerRect.height;
        displayWidth = displayHeight * imageAspectRatio;
      } else {
        // Container is taller than image aspect ratio - width constrained
        displayWidth = containerRect.width;
        displayHeight = displayWidth / imageAspectRatio;
      }
      
      setImageDimensions({
        width: displayWidth,
        height: displayHeight
      });
    }
  };

  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current && containerRef.current) {
        // Calculate the actual displayed image dimensions
        const containerRect = containerRef.current.getBoundingClientRect();
        const imageAspectRatio = IMG_W / IMG_H;
        const containerAspectRatio = containerRect.width / containerRect.height;
        
        let displayWidth, displayHeight;
        
        if (containerAspectRatio > imageAspectRatio) {
          // Container is wider than image aspect ratio - height constrained
          displayHeight = containerRect.height;
          displayWidth = displayHeight * imageAspectRatio;
        } else {
          // Container is taller than image aspect ratio - width constrained
          displayWidth = containerRect.width;
          displayHeight = displayWidth / imageAspectRatio;
        }
        
        setImageDimensions({
          width: displayWidth,
          height: displayHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      className={cn("relative w-full h-full overflow-hidden flex items-center justify-center bg-sky-800", className)} 
      ref={containerRef}
    >
      {/* Background Image */}
      <img
        ref={imageRef}
        src="/images/RIXS_endstation.png"
        alt="RIXS Endstation Schematic"
        className={cn(
          "max-w-full max-h-full object-contain",
          hoveredRegion ? "cursor-pointer" : "cursor-default"
        )}
        style={{
          aspectRatio: `${IMG_W} / ${IMG_H}`, // Lock to original 2222/1316 aspect ratio
        }}
        onLoad={handleImageLoad}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {/* Interactive Regions Overlay */}
      {imageLoaded && containerRef.current && REGIONS.map((region) => {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const imageAspectRatio = IMG_W / IMG_H;
        const containerAspectRatio = containerRect.width / containerRect.height;
        
        // Calculate image position and size within container
        let imageLeft, imageTop, imageWidth, imageHeight;
        
        if (containerAspectRatio > imageAspectRatio) {
          imageHeight = containerRect.height;
          imageWidth = imageHeight * imageAspectRatio;
          imageLeft = (containerRect.width - imageWidth) / 2;
          imageTop = 0;
        } else {
          imageWidth = containerRect.width;
          imageHeight = imageWidth / imageAspectRatio;
          imageLeft = 0;
          imageTop = (containerRect.height - imageHeight) / 2;
        }
        
        const isRegionActive = hoveredRegion === region.name || selectedRegion === region.name;
        const shouldShowOverlay = !hideRegionOverlays || isRegionActive;
        
        return (
          <div
            key={region.name}
            className={cn(
              "absolute border-2 border-dashed transition-all duration-200 pointer-events-none",
              shouldShowOverlay && isRegionActive
                ? "bg-yellow-400/20 border-yellow-400"
                : shouldShowOverlay
                ? "bg-transparent border-yellow-400/30"
                : "bg-transparent border-transparent",
              regionClassName
            )}
            style={{
              left: imageLeft + (region.x * scale),
              top: imageTop + (region.y * scale),
              width: region.w * scale,
              height: region.h * scale,
            }}
          >
            {/* Region Label */}
            {(hoveredRegion === region.name || selectedRegion === region.name || alwaysShowRegionLabels) && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                <span className={cn(
                  "bg-yellow-400 text-black px-2 py-1 rounded text-sm font-semibold whitespace-nowrap",
                  regionLabelClassName
                )}>
                  {region.name}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* PV Overlays */}
      {!hideControls && imageLoaded && containerRef.current && PV_OVERLAYS.map((overlay, index) => {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const imageAspectRatio = IMG_W / IMG_H;
        const containerAspectRatio = containerRect.width / containerRect.height;
        
        // Calculate image position and size within container
        let imageLeft, imageTop, imageWidth, imageHeight;
        
        if (containerAspectRatio > imageAspectRatio) {
          imageHeight = containerRect.height;
          imageWidth = imageHeight * imageAspectRatio;
          imageLeft = (containerRect.width - imageWidth) / 2;
          imageTop = 0;
        } else {
          imageWidth = containerRect.width;
          imageHeight = imageWidth / imageAspectRatio;
          imageLeft = 0;
          imageTop = (containerRect.height - imageHeight) / 2;
        }
        
        const scale = imageWidth / IMG_W;
        const ophydDevice = ophydDevices[overlay.pv];
        const isConnected = ophydDevice?.connected || false;
        const value = ophydDevice?.value;

        return (
          <PVOverlay
            key={`${overlay.region}-${index}`}
            x={imageLeft + (overlay.x * scale)}
            y={imageTop + (overlay.y * scale)}
            label={overlay.label}
            pv={overlay.pv}
            value={value}
            isConnected={isConnected}
            scale={1} // Scale is already applied to x,y coordinates
            isRegionHovered={hoveredRegion === overlay.region}
            onSetValue={handleSetValueRequest}
          />
        );
      })}

      {/* Loading State */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-600">Loading endstation schematic...</div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useRef, WheelEvent, MouseEvent, TouchEvent, useCallback, useEffect } from 'react';
import { ZoomInIcon, ZoomOutIcon, ResetZoomIcon, ShareIcon, CopyIcon, EmailIcon, DownloadIcon, CheckIcon, WhatsappIcon } from './Shared.tsx';

interface InteractiveImageViewerProps {
  src: string;
  alt: string;
  projectName: string;
}

const ZOOM_SPEED = 0.1;
const MIN_SCALE = 1; // Start at 1 to prevent zooming out smaller than container
const MAX_SCALE = 5;

// Helper to calculate distance between two touch points
const getTouchDistance = (touches: React.TouchList) => {
    return Math.sqrt(
        Math.pow(touches[0].clientX - touches[1].clientX, 2) +
        Math.pow(touches[0].clientY - touches[1].clientY, 2)
    );
};


export const InteractiveImageViewer: React.FC<InteractiveImageViewerProps> = ({ src, alt, projectName }) => {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const interactionStartRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, initialDistance: 0 });

  // Use a ref to hold the latest transform state to avoid stale closures in window event listeners
  const transformRef = useRef(transform);
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);


  const applyTransform = useCallback(({ scale, x, y }: { scale: number, x: number, y: number }) => {
    const container = containerRef.current;
    if (!container) {
      setTransform({ scale, x, y });
      return;
    }
    
    const rect = container.getBoundingClientRect();
    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));

    const imageWidth = rect.width * clampedScale;
    const imageHeight = rect.height * clampedScale;

    // Center if smaller than container, otherwise clamp to boundaries
    const clampedX = imageWidth > rect.width ? Math.max(rect.width - imageWidth, Math.min(0, x)) : (rect.width - imageWidth) / 2;
    const clampedY = imageHeight > rect.height ? Math.max(rect.height - imageHeight, Math.min(0, y)) : (rect.height - imageHeight) / 2;
    
    setTransform({ scale: clampedScale, x: clampedX, y: clampedY });
  }, []);
  
  // --- MOUSE EVENT LISTENERS (ATTACHED TO WINDOW FOR ROBUST DRAGGING) ---
  const handleWindowMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!isInteracting) return;
    const dx = e.clientX - interactionStartRef.current.startX;
    const dy = e.clientY - interactionStartRef.current.startY;
    applyTransform({
      scale: transformRef.current.scale,
      x: interactionStartRef.current.initialX + dx,
      y: interactionStartRef.current.initialY + dy,
    });
  }, [isInteracting, applyTransform]);

  const handleWindowMouseUp = useCallback(() => {
    setIsInteracting(false);
  }, []);

  useEffect(() => {
    if (isInteracting) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isInteracting, handleWindowMouseMove, handleWindowMouseUp]);

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    setIsInteracting(true);
    interactionStartRef.current.startX = e.clientX;
    interactionStartRef.current.startY = e.clientY;
    interactionStartRef.current.initialX = transform.x;
    interactionStartRef.current.initialY = transform.y;
  };

  // --- TOUCH EVENT LISTENERS ---
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      setIsInteracting(true);
      interactionStartRef.current.startX = e.touches[0].clientX;
      interactionStartRef.current.startY = e.touches[0].clientY;
      interactionStartRef.current.initialX = transform.x;
      interactionStartRef.current.initialY = transform.y;
    } else if (e.touches.length === 2) {
      interactionStartRef.current.initialDistance = getTouchDistance(e.touches);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isInteracting && e.touches.length === 1) return; // Prevent pan without interaction start
    e.preventDefault();
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - interactionStartRef.current.startX;
      const dy = e.touches[0].clientY - interactionStartRef.current.startY;
      applyTransform({
        scale: transform.scale,
        x: interactionStartRef.current.initialX + dx,
        y: interactionStartRef.current.initialY + dy,
      });
    } else if (e.touches.length === 2) {
      const newDistance = getTouchDistance(e.touches);
      const scale = transform.scale * (newDistance / interactionStartRef.current.initialDistance);
      applyTransform({ ...transform, scale });
      interactionStartRef.current.initialDistance = newDistance; // Update for continuous zoom
    }
  };

  const handleTouchEnd = () => {
    setIsInteracting(false);
  };
  
  // --- WHEEL/ZOOM EVENT LISTENER ---
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const newScale = transform.scale - e.deltaY * ZOOM_SPEED * 0.1;
    applyTransform({ ...transform, scale: newScale });
  };
  
  // --- UI ACTION HANDLERS ---
  const handleZoom = (direction: 'in' | 'out') => {
    const newScale = transform.scale + (direction === 'in' ? ZOOM_SPEED : -ZOOM_SPEED);
    applyTransform({ ...transform, scale: newScale });
  };
  
  const resetTransform = () => {
    applyTransform({ scale: 1, x: 0, y: 0 });
  };

  const handleShare = async (type: 'copy' | 'email' | 'whatsapp' | 'download') => {
    const showFeedback = (message: string) => {
      setShareFeedback(message);
      setTimeout(() => setShareFeedback(null), 2500);
    };

    if (type === 'copy') {
      try {
        await navigator.clipboard.writeText(src);
        showFeedback('Link copiado!');
      } catch (err) {
        showFeedback('Falha ao copiar.');
      }
    } else if (type === 'email') {
      window.location.href = `mailto:?subject=Projeto: ${encodeURIComponent(projectName)}&body=Olá! Veja a imagem do projeto: ${encodeURIComponent(src)}`;
    } else if (type === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=Olá! Veja a imagem do projeto "${encodeURIComponent(projectName)}": ${encodeURIComponent(src)}`, '_blank');
    } else if (type === 'download') {
      const link = document.createElement('a');
      link.href = src;
      link.download = `${projectName.replace(/\s+/g, '_').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setShowShareMenu(false);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
        if (showShareMenu && controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
            setShowShareMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);
  

  return (
    <div 
      ref={containerRef}
      className="w-full aspect-square bg-[#f0e9dc] dark:bg-[#2d2424] rounded-lg overflow-hidden relative cursor-grab active:cursor-grabbing touch-none select-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
        style={{ 
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          willChange: 'transform' // Performance optimization for transform
        }}
        draggable="false"
      />
      
      {/* Controls */}
      <div ref={controlsRef} className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2">
        <div className="flex flex-col gap-1 p-1 bg-[#3e3535]/70 backdrop-blur-sm rounded-lg">
          <button onClick={() => handleZoom('in')} className="p-2 text-white hover:bg-white/20 rounded-md" title="Aumentar Zoom"><ZoomInIcon /></button>
          <button onClick={() => handleZoom('out')} className="p-2 text-white hover:bg-white/20 rounded-md" title="Diminuir Zoom"><ZoomOutIcon /></button>
          <button onClick={resetTransform} className="p-2 text-white hover:bg-white/20 rounded-md" title="Resetar Zoom"><ResetZoomIcon /></button>
        </div>
        <div className="relative">
            <button onClick={() => setShowShareMenu(prev => !prev)} className="p-3 bg-[#3e3535]/70 backdrop-blur-sm rounded-full text-white hover:bg-white/20" title="Compartilhar">
                <ShareIcon />
            </button>
            {showShareMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#fffefb] dark:bg-[#4a4040] rounded-lg shadow-xl p-1 z-20 animate-scaleIn" style={{transformOrigin: 'bottom right'}}>
                    <button onClick={() => handleShare('download')} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded text-sm text-[#3e3535] dark:text-[#c7bca9] hover:bg-[#f0e9dc] dark:hover:bg-[#5a4f4f]"><DownloadIcon /> Baixar Imagem</button>
                    <button onClick={() => handleShare('whatsapp')} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded text-sm text-[#3e3535] dark:text-[#c7bca9] hover:bg-[#f0e9dc] dark:hover:bg-[#5a4f4f]"><WhatsappIcon /> WhatsApp</button>
                    <button onClick={() => handleShare('email')} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded text-sm text-[#3e3535] dark:text-[#c7bca9] hover:bg-[#f0e9dc] dark:hover:bg-[#5a4f4f]"><EmailIcon /> Email</button>
                    <button onClick={() => handleShare('copy')} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded text-sm text-[#3e3535] dark:text-[#c7bca9] hover:bg-[#f0e9dc] dark:hover:bg-[#5a4f4f]">
                        {shareFeedback ? <><CheckIcon className="text-green-500" /> {shareFeedback}</> : <><CopyIcon /> Copiar Link</>}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

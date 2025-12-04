import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ResizablePanelsProps {
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
    defaultLeftWidth?: number; // percentage (0-100)
    minLeftWidth?: number; // percentage
    minRightWidth?: number; // percentage
}

export default function ResizablePanels({
    leftPanel,
    rightPanel,
    defaultLeftWidth = 42,
    minLeftWidth = 20,
    minRightWidth = 20,
}: ResizablePanelsProps) {
    const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const offsetX = e.clientX - containerRect.left;
            const percentage = (offsetX / containerRect.width) * 100;

            // Apply constraints
            const constrainedPercentage = Math.min(
                Math.max(percentage, minLeftWidth),
                100 - minRightWidth
            );

            setLeftWidth(constrainedPercentage);
        },
        [isDragging, minLeftWidth, minRightWidth]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div
            ref={containerRef}
            style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                position: 'relative',
            }}
        >
            {/* Left Panel */}
            <div
                style={{
                    width: `${leftWidth}%`,
                    overflow: 'auto',
                    paddingRight: '20px',
                    pointerEvents: isDragging ? 'none' : 'auto',
                }}
            >
                {leftPanel}
            </div>

            {/* Resizable Divider */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    width: '8px',
                    cursor: 'col-resize',
                    backgroundColor: isDragging ? '#0066CC' : '#e0e0e0',
                    position: 'relative',
                    flexShrink: 0,
                    transition: isDragging ? 'none' : 'background-color 0.2s',
                    userSelect: 'none',
                }}
            >
                {/* Visual indicator */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '3px',
                        height: '40px',
                        backgroundColor: isDragging ? '#fff' : '#999',
                        borderRadius: '2px',
                        transition: isDragging ? 'none' : 'background-color 0.2s',
                    }}
                />
            </div>

            {/* Right Panel */}
            <div
                style={{
                    width: `${100 - leftWidth}%`,
                    overflow: 'auto',
                    paddingLeft: '20px',
                    pointerEvents: isDragging ? 'none' : 'auto',
                }}
            >
                {rightPanel}
            </div>
        </div>
    );
}

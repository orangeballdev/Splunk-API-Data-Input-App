import React, { useEffect, useState } from 'react';
import type { CallBackProps, Step } from 'react-joyride';
import { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import TourWrapper from './TourWrapper';

export interface TourConfig {
    /** Unique localStorage key for this tour */
    storageKey: string;
    /** Tour steps to display */
    steps: Step[];
    /** Whether to initialize tour as running on mount */
    defaultRun?: boolean;
    /** Whether to track step index (for multi-step tours) */
    trackStepIndex?: boolean;
    /** Additional props to pass to TourWrapper */
    wrapperProps?: Record<string, unknown>;
}

export interface TourProps {
    run?: boolean;
    onFinish?: () => void;
}

/**
 * Higher-order component that wraps tour components with common functionality.
 * Handles localStorage persistence, state management, and callback logic.
 * 
 * @param config - Tour configuration including steps, storage key, and options
 * @returns A configured tour component
 */
export function withTour(config: TourConfig) {
    const {
        storageKey,
        steps,
        defaultRun = true,
        trackStepIndex = false,
        wrapperProps = {},
    } = config;

    const TourComponent: React.FC<TourProps> = ({ run = defaultRun, onFinish }) => {
        const [runTour, setRunTour] = useState(() => {
            const hasSeenTour = localStorage.getItem(storageKey);
            return run && !hasSeenTour;
        });

        const [stepIndex, setStepIndex] = useState(0);

        // Handle run prop changes (for dependent tours or manual triggers)
        useEffect(() => {
            const hasSeenTour = localStorage.getItem(storageKey);
            if (run && !hasSeenTour) {
                setRunTour(true);
                if (trackStepIndex) {
                    setStepIndex(0);
                }
            }
        }, [run]);

        const handleJoyrideCallback = (data: CallBackProps) => {
            const { action, index, status, type } = data;

            // Handle step navigation for multi-step tours
            if (trackStepIndex && (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND)) {
                const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
                setStepIndex(nextStepIndex);
            }

            // Handle tour completion
            const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
            if (finishedStatuses.includes(status)) {
                setRunTour(false);
                if (trackStepIndex) {
                    setStepIndex(0);
                }
                localStorage.setItem(storageKey, 'true');
                if (onFinish) {
                    onFinish();
                }
            }
        };

        return (
            <TourWrapper
                steps={steps}
                run={runTour}
                stepIndex={trackStepIndex ? stepIndex : undefined}
                callback={handleJoyrideCallback}
                {...wrapperProps}
            />
        );
    };

    TourComponent.displayName = `withTour(${storageKey})`;

    return TourComponent;
}

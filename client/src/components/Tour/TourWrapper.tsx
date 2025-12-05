import React from 'react';
import type { CallBackProps, Step } from 'react-joyride';
import Joyride from 'react-joyride';

interface TourWrapperProps {
    steps: Step[];
    run: boolean;
    stepIndex?: number;
    continuous?: boolean;
    showProgress?: boolean;
    showSkipButton?: boolean;
    scrollToFirstStep?: boolean;
    disableScrolling?: boolean;
    disableScrollParentFix?: boolean;
    scrollOffset?: number;
    scrollDuration?: number;
    spotlightPadding?: number;
    floaterProps?: Record<string, unknown>;
    callback: (data: CallBackProps) => void;
}

const TourWrapper: React.FC<TourWrapperProps> = ({
    steps,
    run,
    stepIndex,
    continuous = true,
    showProgress = true,
    showSkipButton = true,
    scrollToFirstStep = true,
    disableScrolling = false,
    disableScrollParentFix = false,
    scrollOffset = 300,
    scrollDuration = 500,
    spotlightPadding = 0,
    floaterProps,
    callback,
}) => {
    return (
        <Joyride
            steps={steps}
            run={run}
            stepIndex={stepIndex}
            continuous={continuous}
            showProgress={showProgress}
            showSkipButton={showSkipButton}
            scrollToFirstStep={scrollToFirstStep}
            disableScrolling={disableScrolling}
            disableScrollParentFix={disableScrollParentFix}
            scrollOffset={scrollOffset}
            scrollDuration={scrollDuration}
            spotlightPadding={spotlightPadding}
            floaterProps={floaterProps}
            callback={callback}
            styles={{
                options: {
                    primaryColor: '#198528',
                    zIndex: 10000,
                },
                tooltip: {
                    fontSize: 14,
                },
                tooltipContainer: {
                    textAlign: 'left',
                },
                buttonNext: {
                    backgroundColor: '#198528',
                    fontSize: 14,
                    padding: '8px 16px',
                },
                buttonBack: {
                    marginRight: 10,
                    fontSize: 14,
                },
                buttonSkip: {
                    fontSize: 14,
                },
            }}
            locale={{
                back: 'Back',
                close: 'Close',
                last: 'Finish',
                next: 'Next',
                skip: 'Skip Tour',
            }}
        />
    );
};

export default TourWrapper;

import Heading from '@splunk/react-ui/Heading';
import P from '@splunk/react-ui/Paragraph';
import type { Step } from 'react-joyride';
import { withTour } from './withTour';

const steps: Step[] = [
    {
        target: '[data-tour="json-viewer"]',
        content: (
            <div>
                <Heading level={3} style={{ marginTop: 0 }}>🎉 Data Loaded!</Heading>
                <P>
                    Great! Your API data has been fetched and displayed here. 
                    Now let me show you how to interact with it.
                </P>
            </div>
        ),
        placement: 'center',
        disableBeacon: true,
        spotlightPadding: 20,
    },
    {
        target: '[data-tour="json-key"]',
        content: (
            <div>
                <Heading level={3} style={{ marginTop: 0 }}>Click to Rename Keys 🔑</Heading>
                <P>
                    <strong>Click on any key name</strong> in the JSON tree to rename it. 
                    This is useful for making field names more readable or standardized.
                </P>
                <P style={{ marginBottom: 0, fontSize: '13px', color: '#666' }}>
                    Example: Click on "id" to rename it to "product_id"
                </P>
            </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightPadding: 10,
    },
    {
        target: '[data-tour="json-key"]',
        content: (
            <div>
                <Heading level={3} style={{ marginTop: 0 }}>Shift+Click to Exclude Paths 🚫</Heading>
                <P>
                    <strong>Hold Shift and click</strong> on any key to add its JSONPath to the exclude list. 
                    This removes unwanted fields from your data.
                </P>
              
            </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightPadding: 10,
    },
];

const JsonPreviewTour = withTour({
    storageKey: 'hasSeenJsonPreviewTour',
    steps,
    defaultRun: false,
    wrapperProps: {
        floaterProps: {
            disableAnimation: false,
        },
    },
});

export default JsonPreviewTour;

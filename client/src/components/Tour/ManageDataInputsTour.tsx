import Heading from '@splunk/react-ui/Heading';
import P from '@splunk/react-ui/Paragraph';
import type { Step } from 'react-joyride';
import { withTour } from './withTour';

const steps: Step[] = [
    {
        target: 'body',
        content: (
            <div>
                <Heading level={2} style={{ marginTop: 0 }}>Welcome to Manage Data Inputs! 👋</Heading>
                <P>
                    This page allows you to view and manage all your configured API data inputs. 
                    Let's take a quick tour to get you started.
                </P>
            </div>
        ),
        placement: 'center',
        disableBeacon: true,
    },
    {
        target: '[data-tour="add-new-button"]',
        content: (
            <div>
                <Heading level={3} style={{ marginTop: 0 }}>Add New Data Input</Heading>
                <P>
                    Click this button to create a new API data input. You'll be able to 
                    configure the API endpoint, preview data, and set up how it's stored in Splunk.
                </P>
            </div>
        ),
        placement: 'bottom',
        disableBeacon: true,
    },
];

const ManageDataInputsTour = withTour({
    storageKey: 'hasSeenManageInputsTour',
    steps,
    defaultRun: true,
});

export default ManageDataInputsTour;

import Heading from '@splunk/react-ui/Heading';
import P from '@splunk/react-ui/Paragraph';
import type { Step } from 'react-joyride';
import { withTour } from './withTour';

const steps: Step[] = [
    {
        target: '[data-tour="inputs-table"]',
        content: (
            <div>
                <Heading level={3} style={{ marginTop: 0 }}>Manage Your Data Inputs 📋</Heading>
                <P>
                    Let me show you how to manage your configured data inputs.
                </P>
            </div>
        ),
        placement: 'top',
        disableBeacon: true,
        spotlightPadding: 20,
    },
    {
        target: '[data-tour="enable-toggle"]',
        content: (
            <div>
                <Heading level={3} style={{ marginTop: 0 }}>Enable/Disable Toggle 🔄</Heading>
                <P>
                    Use this toggle to quickly enable or disable a data input without deleting it.
                </P>
                <P style={{ marginBottom: 0, fontSize: '13px', color: '#666' }}>
                    Disabled inputs won't fetch data but remain configured for later use.
                </P>
            </div>
        ),
        placement: 'left',
        spotlightPadding: 10,
    },
    {
        target: '[data-tour="edit-button"]',
        content: (
            <div>
                <Heading level={3} style={{ marginTop: 0 }}>Edit Button ✏️</Heading>
                <P>
                    Click this button to modify the configuration of your data input.
                </P>
                <P style={{ marginBottom: 0, fontSize: '13px', color: '#666' }}>
                    You can change the URL, output location, field mappings, and more.
                </P>
            </div>
        ),
        placement: 'left',
        spotlightPadding: 10,
    },
    {
        target: 'tbody tr:first-child [data-test="actions-secondary-toggle"]',
        content: (
            <div>
                <Heading level={3} style={{ marginTop: 0 }}>More Actions Menu ⋮</Heading>
                <P>
                    <strong>Click the three dots</strong> to see additional options like Delete and View Data.
                </P>
            </div>
        ),
        placement: 'left',
        spotlightPadding: 10,
    },
];

const ManageInputsTableTour = withTour({
    storageKey: 'hasSeenManageInputsTableTour',
    steps,
    defaultRun: false,
    trackStepIndex: true,
});

export default ManageInputsTableTour;

import Heading from '@splunk/react-ui/Heading';
import List from '@splunk/react-ui/List';
import P from '@splunk/react-ui/Paragraph';
import type { Step } from 'react-joyride';
import { withTour } from './withTour';

const steps: Step[] = [
    {
        target: 'body',
        content: (
            <div>
                <Heading level={2} style={{ marginTop: 0 }}>Welcome to the New Data Input Form! 🚀</Heading>
                <P>
                    This form allows you to create a new API data input. We'll walk you through 
                    each section to help you get started quickly.
                </P>
            </div>
        ),
        placement: 'center',
        disableBeacon: true,
    },
    {
        target: '[data-tour="input-tabs"]',
        content: (
            <div>
                <Heading level={3} style={{ marginTop: 0 }}>Choose Output Type</Heading>
                <P>
                    Select where you want to store your data:
                </P>
                <List style={{ marginBottom: 0 }}>
                    <List.Item><strong>KV Store</strong>: Store data in a Splunk KV Store collection</List.Item>
                    <List.Item><strong>Index</strong>: Send data directly to a Splunk index</List.Item>
                </List>
            </div>
        ),
        placement: 'bottom',
        disableBeacon: true,
        spotlightPadding: 20,
    },
    {
        target: '[data-tour="basic-config"]',
        content: (
            <div>
                <Heading level={3} style={{ marginTop: 0 }}>Basic Configuration</Heading>
                <P>
                    Start by giving your input a name and providing the API URL you want to fetch data from.
                </P>
            </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightPadding: 20,
    },
    {
        target: '[data-tour="fetch-button"]',
        content: (
            <div>
                <Heading level={3} style={{ marginTop: 0 }}>Fetch Data Preview</Heading>
                <P>
                    Click this button to fetch and preview your API data. The preview will appear 
                    on the right side of the screen.
                </P>
            </div>
        ),
        placement: 'bottom',
        disableBeacon: true,
        spotlightPadding: 20,
    },
    {
        target: '[data-tour="json-viewer"]',
        content: (
            <div>
                <Heading level={3} style={{ marginTop: 0 }}>JSON Preview Panel</Heading>
                <P>
                    After fetching data, it will appear here. You can:
                </P>
                <List style={{ marginBottom: 0 }}>
                    <List.Item>Click on any JSON path to exclude it from your data</List.Item>
                    <List.Item>Right-click on keys to rename them</List.Item>
                    <List.Item>Explore the structure of your API response</List.Item>
                </List>
            </div>
        ),
        placement: 'left',
        disableBeacon: true,
        spotlightPadding: 20,
    },
    {
        target: '[data-tour="splunk-config"]',
        content: (
            <div>
                <Heading level={3} style={{ marginTop: 0 }}>Splunk Configuration</Heading>
                <P>
                    Configure how and when your data is stored:
                </P>
                <List style={{ marginBottom: 0 }}>
                    <List.Item><strong>Cron Expression</strong>: Schedule when to fetch data</List.Item>
                    <List.Item><strong>Output Location</strong>: Choose your KV Store collection or index</List.Item>
                    <List.Item><strong>Mode</strong>: Overwrite or append to existing data</List.Item>
                </List>
            </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightPadding: 10,
    },
    {
        target: '[data-tour="data-processing"]',
        content: (
            <div>
                <Heading level={3} style={{ marginTop: 0 }}>Data Processing (Optional)</Heading>
                <P>
                    Use these advanced options to transform your data:
                </P>
                <List style={{ marginBottom: 0 }}>
                    <List.Item><strong>Exclude Paths</strong>: Remove unwanted JSON fields</List.Item>
                    <List.Item><strong>Separate Arrays</strong>: Split arrays into individual events</List.Item>
                    <List.Item><strong>Key Mappings</strong>: Rename fields in your data</List.Item>
                </List>
            </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightPadding: 10,
    },
    {
        target: '[data-tour="save-button"]',
        content: (
            <div>
                <Heading level={3} style={{ marginTop: 0 }}>Save Your Input</Heading>
                <P>
                    Once you've configured everything, click here to save your data input. 
                    It will start running according to your cron schedule.
                </P>
            </div>
        ),
        placement: 'top',
        disableBeacon: true,
        spotlightPadding: 10,
    },
];

const NewDataInputTour = withTour({
    storageKey: 'hasSeenNewDataInputTour',
    steps,
    defaultRun: true,
    wrapperProps: {
        floaterProps: {
            disableAnimation: false,
        },
    },
});

export default NewDataInputTour;

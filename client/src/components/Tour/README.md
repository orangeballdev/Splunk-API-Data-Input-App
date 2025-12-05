# Tour Components Architecture

## Overview

The tour components use a Higher-Order Component (HOC) pattern to eliminate code duplication and provide a consistent API for all guided tours throughout the application.

## Architecture

### `withTour` HOC

The `withTour` higher-order component wraps tour configurations with common functionality:

- **State Management**: Handles `runTour` state and step index tracking
- **LocalStorage Integration**: Automatically persists tour completion status
- **Callback Handling**: Manages tour lifecycle events (finish, skip, navigation)
- **Props Forwarding**: Passes through custom props to the underlying `TourWrapper`


## Usage

### Creating a New Tour

```typescript
import type { Step } from 'react-joyride';
import { withTour } from './withTour';

// 1. Define your tour steps
const steps: Step[] = [
    {
        target: '[data-tour="my-element"]',
        content: (
            <div>
                <h3>Step Title</h3>
                <p>Step description</p>
            </div>
        ),
        placement: 'bottom',
        disableBeacon: true,
    },
    // ... more steps
];

// 2. Create tour component with configuration
const MyTour = withTour({
    storageKey: 'hasSeenMyTour',
    steps,
    defaultRun: true,
    trackStepIndex: false, // Set to true for multi-step tours with navigation
    wrapperProps: {
        // Optional: Additional props for TourWrapper
        floaterProps: {
            disableAnimation: false,
        },
    },
});

export default MyTour;
```

### Using a Tour in Your Component

```typescript
import MyTour from './components/Tour/MyTour';

function MyComponent() {
    const [runTour, setRunTour] = useState(true);

    return (
        <>
            <MyTour 
                run={runTour} 
                onFinish={() => setRunTour(false)} 
            />
            {/* Your component content */}
        </>
    );
}
```

## Configuration Options

### `TourConfig` Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `storageKey` | `string` | Required | Unique key for localStorage persistence |
| `steps` | `Step[]` | Required | Array of Joyride step definitions |
| `defaultRun` | `boolean` | `true` | Whether tour should run on first mount |
| `trackStepIndex` | `boolean` | `false` | Enable step-by-step navigation tracking |
| `wrapperProps` | `object` | `{}` | Additional props passed to TourWrapper |

### `TourProps` (Runtime Props)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `run` | `boolean` | Uses `defaultRun` | Control when tour should run |
| `onFinish` | `function` | `undefined` | Callback fired when tour completes |

## Existing Tours

### 1. ManageDataInputsTour
- **Purpose**: Welcome tour for the Manage Inputs page
- **Storage Key**: `hasSeenManageInputsTour`
- **Steps**: 2
- **Default Run**: Yes

### 2. ManageInputsTableTour
- **Purpose**: Demonstrates table actions (edit, delete, toggle)
- **Storage Key**: `hasSeenManageInputsTableTour`
- **Steps**: 4
- **Default Run**: No
- **Features**: Step tracking enabled

### 3. NewDataInputTour
- **Purpose**: Guides users through creating a new data input
- **Storage Key**: `hasSeenNewDataInputTour`
- **Steps**: 8
- **Default Run**: Yes

### 4. JsonPreviewTour
- **Purpose**: Shows how to interact with JSON viewer
- **Storage Key**: `hasSeenJsonPreviewTour`
- **Steps**: 3
- **Default Run**: No

## Tour Dependencies

Some tours are designed to run sequentially:

1. **ManageDataInputsTour** → **ManageInputsTableTour**
   - Main tour finishes, then table actions tour starts
   - Implemented in `ManageDataInputs.tsx` with `handleMainTourFinish`

## Best Practices

1. **Storage Keys**: Use descriptive, unique keys prefixed with `hasSeen`
2. **Step Targets**: Use `data-tour` attributes for consistent targeting
3. **Content**: Keep explanations concise but informative
4. **Step Order**: Logical flow from general to specific
5. **Placement**: Consider UI layout when setting step placement
6. **Testing**: Clear localStorage during development to test tours

## Resetting Tours

Tours can be reset from the Home page's "Replay Tours" section:
- Removes localStorage flag for specific tour
- Navigates to appropriate page
- Tour runs automatically on page load

## Migration Notes

All tour components have been migrated from the previous pattern:
- **Before**: ~70-100 lines per tour with duplicated logic
- **After**: ~40-60 lines per tour, focused on content
- **Code Reduction**: ~40% fewer lines per tour component
- **Maintainability**: Single source of truth for tour behavior

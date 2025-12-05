import Heading from '@splunk/react-ui/Heading';
import Message from '@splunk/react-ui/Message';
import { useMemo } from 'react';
import ClickableJSONTree from './ClickableJSONTree';

interface JSONViewerProps {
    initialData: string;
    onPathClick?: (path: string) => void;
    onKeyRename?: (oldKey: string, newKey: string) => void;
    keyMappings?: Record<string, string>;
}

export default function JSONViewer({ initialData, onPathClick, onKeyRename, keyMappings }: JSONViewerProps) {
    const { parsedJSON, isValidJSON } = useMemo(() => {
        if (!initialData) return { parsedJSON: null, isValidJSON: true };
        try {
            const parsed = JSON.parse(initialData);
            return { parsedJSON: parsed, isValidJSON: true };
        } catch {
            return { parsedJSON: null, isValidJSON: false };
        }
    }, [initialData]);

    const JSONTreeMemo = useMemo(() => {
        return parsedJSON ? (
            <ClickableJSONTree 
                data={parsedJSON} 
                onPathClick={onPathClick}
                onKeyRename={onKeyRename}
                keyMappings={keyMappings}
            />
        ) : (
            <Message type="info">Fetch data to see preview. Click on any key to add it to exclusions.</Message>
        );
    }, [parsedJSON, onPathClick, onKeyRename, keyMappings]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, paddingBottom: '10px' }}>
                <Heading level={2}>Preview</Heading>
                {(onPathClick || onKeyRename) && (
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                        {onKeyRename && 'Click on any key to rename it'}
                        {onPathClick && onKeyRename && ' | '}
                        {onPathClick && 'Shift+Click to add it to the exclude list'}
                    </p>
                )}
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
                {isValidJSON ? (
                    JSONTreeMemo
                ) : (
                    <p color="error" style={{ marginTop: 1, textAlign: 'center' }}>
                        Invalid JSON data provided.
                    </p>
                )}
            </div>
        </div>
    );
}

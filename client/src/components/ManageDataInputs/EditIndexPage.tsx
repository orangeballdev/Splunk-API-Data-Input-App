import { useCallback, useRef, useState } from 'react';

import NewIndexDataInputForm from '../DataInputs/Index/NewIndexDataInputForm';
import JSONViewer from '../Json/JsonViewer';
import ResizablePanels from '../common/ResizablePanels';
import type { DataInputAppConfig } from './DataInputs.types';

interface EditIndexPageProps {
    dataInputAppConfig: DataInputAppConfig;
    setDataInputAppConfig: React.Dispatch<React.SetStateAction<DataInputAppConfig>>;
    onSuccess: () => void;
}

export default function EditIndexPage({ dataInputAppConfig, setDataInputAppConfig, onSuccess }: EditIndexPageProps) {
    const [jsonData, setJsonData] = useState<string>('');
    const [keyMappings, setKeyMappings] = useState<Record<string, string>>(dataInputAppConfig?.key_mappings ?? {});
    const addExcludePathRef = useRef<((path: string) => void) | null>(null);
    const addKeyMappingRef = useRef<((oldKey: string, newKey: string) => void) | null>(null);

    const handlePathClick = useCallback((path: string) => {
        if (addExcludePathRef.current) {
            addExcludePathRef.current(path);
        }
    }, []);

    const handleKeyRename = useCallback((oldKey: string, newKey: string) => {
        setKeyMappings(prev => ({ ...prev, [oldKey]: newKey }));
        if (addKeyMappingRef.current) {
            addKeyMappingRef.current(oldKey, newKey);
        }
    }, []);

    return (
        <div style={{ padding: '20px', height: '100%' }}>
            <ResizablePanels
                defaultLeftWidth={50}
                minLeftWidth={25}
                minRightWidth={30}
                leftPanel={
                    <NewIndexDataInputForm
                        dataInputAppConfig={dataInputAppConfig}
                        setDataInputAppConfig={setDataInputAppConfig}
                        onDataFetched={setJsonData}
                        onSuccess={onSuccess}
                        onAddExcludePathRef={(fn) => { addExcludePathRef.current = fn; }}
                        onAddKeyMappingRef={(fn) => { addKeyMappingRef.current = fn; }}
                        onKeyMappingsChange={setKeyMappings}
                    />
                }
                rightPanel={
                    <JSONViewer 
                        initialData={jsonData} 
                        onPathClick={handlePathClick}
                        onKeyRename={handleKeyRename}
                        keyMappings={keyMappings}
                    />
                }
            />
        </div>
    );
}

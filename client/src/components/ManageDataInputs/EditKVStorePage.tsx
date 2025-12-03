import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import { useCallback, useRef, useState } from 'react';

import NewKVStoreDataInputForm from '../DataInputs/KVStore/NewDataInputForm';
import JSONViewer from '../Json/JsonViewer';
import type { DataInputAppConfig } from './DataInputs.types';

interface EditKVStorePageProps {
    dataInputAppConfig: DataInputAppConfig;
    setDataInputAppConfig: React.Dispatch<React.SetStateAction<DataInputAppConfig>>;
    onSuccess: () => void;
}

export default function EditKVStorePage({ dataInputAppConfig, setDataInputAppConfig, onSuccess }: EditKVStorePageProps) {
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
        <ColumnLayout gutter={100}>
            <ColumnLayout.Row>
                <ColumnLayout.Column span={6}>
                    <NewKVStoreDataInputForm
                        dataInputAppConfig={dataInputAppConfig}
                        setDataInputAppConfig={setDataInputAppConfig}
                        onDataFetched={setJsonData}
                        onSuccess={onSuccess}
                        onAddExcludePathRef={(fn) => { addExcludePathRef.current = fn; }}
                        onAddKeyMappingRef={(fn) => { addKeyMappingRef.current = fn; }}
                        onKeyMappingsChange={setKeyMappings}
                    />
                </ColumnLayout.Column>
                <ColumnLayout.Column span={6}>
                    <JSONViewer 
                        initialData={jsonData} 
                        onPathClick={handlePathClick}
                        onKeyRename={handleKeyRename}
                        keyMappings={keyMappings}
                    />
                </ColumnLayout.Column>
            </ColumnLayout.Row>
        </ColumnLayout>
    );
}

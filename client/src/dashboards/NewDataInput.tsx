import MessageBar from '@splunk/react-ui/MessageBar';
import TabBar from '@splunk/react-ui/TabBar';
import { useCallback, useEffect, useRef, useState } from 'react';
import NewKVStoreDataInputForm from '../components/DataInputs/KVStore/NewDataInputForm';
import JSONViewer from '../components/Json/JsonViewer';
/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { createDOMID } from '@splunk/ui-utils/id';
import ResizablePanels from '../components/common/ResizablePanels';
import NewIndexDataInputForm from '../components/DataInputs/Index/NewIndexDataInputForm';
import JsonPreviewTour from '../components/Tour/JsonPreviewTour';
import NewDataInputTour from '../components/Tour/NewDataInputTour';

export default function NewDataInput() {
  const [jsonData, setJsonData] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState('kvstore');
  const [keyMappings, setKeyMappings] = useState<Record<string, string>>({});
  const [runTour, setRunTour] = useState(true);
  const [runJsonTour, setRunJsonTour] = useState(false);
  const [hasShownJsonTour, setHasShownJsonTour] = useState(false);
  const headingId = createDOMID('data-input-success');

  // Ref to pass path additions to form components
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


  const handleTabChange = useCallback(
    (
      _: React.SyntheticEvent,
      { selectedTabId }: { selectedTabId?: string }
    ) => {
      if (selectedTabId) {
        setActiveTabId(selectedTabId);
        setJsonData(''); // Reset JSON preview when switching tabs
        setKeyMappings({}); // Reset key mappings when switching tabs
      }
    },
    []
  );

  // Trigger JSON preview tour when data is first loaded
  useEffect(() => {
    if (jsonData && !hasShownJsonTour) {
      // Small delay to ensure the JSON viewer is rendered
      const timer = setTimeout(() => {
        setRunJsonTour(true);
        setHasShownJsonTour(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [jsonData, hasShownJsonTour]);

  return (
    <div style={{ padding: '20px', height: 'calc(100vh - 100px)' }}>
      <NewDataInputTour run={runTour} onFinish={() => setRunTour(false)} />
      <JsonPreviewTour run={runJsonTour} onFinish={() => setRunJsonTour(false)} />
      <ResizablePanels
        defaultLeftWidth={42}
        minLeftWidth={25}
        minRightWidth={30}
        leftPanel={
          <>
            {successMessage && (
              <MessageBar
                style={{ marginBottom: "15px" }}
                type="success"
                aria-labelledby={headingId}
                onRequestClose={() => setSuccessMessage(null)}
              >
                {successMessage}
              </MessageBar>
            )}
            <div data-tour="input-tabs" style={{ marginBottom: '25px' }}>
            <TabBar style={{ width: '100%', fontSize: '1.2em' }} activeTabId={activeTabId} onChange={handleTabChange}>
              <TabBar.Tab label="KV Store" tabId="kvstore" />
              <TabBar.Tab label="Index" tabId="index" />
            </TabBar>
            </div>
            {activeTabId === 'kvstore' && (
              <NewKVStoreDataInputForm
                onDataFetched={setJsonData}
                onSuccess={() => setSuccessMessage('Successfully added data input to KV Store.')}
                onAddExcludePathRef={(fn) => { addExcludePathRef.current = fn; }}
                onAddKeyMappingRef={(fn) => { addKeyMappingRef.current = fn; }}
                onKeyMappingsChange={setKeyMappings}
              />
            )}
            {activeTabId === 'index' && (
              <NewIndexDataInputForm
                onDataFetched={setJsonData}
                onSuccess={() => setSuccessMessage('Successfully added data input for Index.')}
                onAddExcludePathRef={(fn) => { addExcludePathRef.current = fn; }}
                onAddKeyMappingRef={(fn) => { addKeyMappingRef.current = fn; }}
                onKeyMappingsChange={setKeyMappings}
              />
            )}
          </>
        }
        rightPanel={
          <div data-tour="json-viewer">
            <JSONViewer 
              initialData={jsonData} 
              onPathClick={handlePathClick}
              onKeyRename={handleKeyRename}
              keyMappings={keyMappings}
            />
          </div>
        }
      />
    </div>
  );
}

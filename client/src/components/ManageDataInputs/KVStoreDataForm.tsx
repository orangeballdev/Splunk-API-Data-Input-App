import TrashCanCross from '@splunk/react-icons/TrashCanCross';
import Button from '@splunk/react-ui/Button';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Heading from '@splunk/react-ui/Heading';
import Message from '@splunk/react-ui/Message';
import RadioList from '@splunk/react-ui/RadioList';
import Select from '@splunk/react-ui/Select';
import Text from '@splunk/react-ui/Text';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import React, { useState } from 'react';
import { generateSelectedOutputString } from '../../utils/dataInputUtils';
import { createNewKVStoreCollection, getAllCollectionNames, type KVStoreCollection } from '../../utils/splunk';
import NewKVStoreForm from '../DataInputs/KVStore/NewKVStoreForm';
import ArrayFieldSelector from '../Json/ArrayFieldSelector';
import EventPreviewModal from '../Json/EventPreviewModal';
import type { DataInputAppConfig, DataInputMode } from './DataInputs.types';


interface KVStoreDataFormProps {
    dataInputAppConfig?: DataInputAppConfig;
    setDataInputAppConfig?: React.Dispatch<React.SetStateAction<DataInputAppConfig>>;
    fetchDataPreview: (url: string, jsonPaths: string[], httpHeaders?: string[]) => Promise<void>;
    fieldsForKvStoreCreation: string[];
    loading: boolean;
    handleSave: (formData: DataInputAppConfig, clearInputs?: () => void) => void;
    setError: (message: string) => void;
    onJSONPathsChange: (jsonPaths: string[]) => void;
    setJsonPreview?: (data: string) => void;
    onAddExcludePathRef?: (fn: (path: string) => void) => void;
    rawData?: unknown;
}

const KVStoreDataForm: React.FC<KVStoreDataFormProps> = (props) => {
    const config: Partial<DataInputAppConfig> = props.dataInputAppConfig || {};
    const modalToggle = React.useRef<HTMLButtonElement | null>(null);
    const previewModalToggle = React.useRef<HTMLButtonElement | null>(null);
    const [collectionNames, setCollectionNames] = useState<KVStoreCollection[]>([]);
    const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const [name, setInputName] = useState(config.name ?? '');
    const [dataInputType, setDataInputType] = useState<string>(config.input_type ?? 'kvstore');
    const [url, setUrl] = useState(config.url ?? "https://dummyjson.com/products");
    const [http_headers, setHttpHeaders] = useState<string[]>(config.http_headers ?? [""]);
    const [cronExpression, setCronExpression] = useState(config.cron_expression ?? '0 * * * *');
    const [selected_output_location, setSelectedCollection] = useState<string>(config.selected_output_location ?? '');
    const [mode, setMode] = useState<DataInputMode>(config.mode ?? 'overwrite');
    const [separateArrayPaths, setSeparateArrayPaths] = useState<string[]>(config.separate_array_paths ?? []);


    const updateConfigField = <K extends keyof DataInputAppConfig>(
        key: K,
        value: DataInputAppConfig[K]
    ) => {
        if (props.setDataInputAppConfig) {
            props.setDataInputAppConfig(prev => ({
                ...prev,
                [key]: value
            }));
        }
    };

    // Use a string array for JSONPath values
    const [jsonPathValues, setJsonPathValues] = useState<string[]>(
        config.excluded_json_paths && config.excluded_json_paths.length > 0
            ? config.excluded_json_paths
            : [""]
    );

    React.useEffect(() => {
        getAllCollectionNames().then(result => {
            setCollectionNames(result);
        });
    }, []);

    // Sync form state when dataInputAppConfig changes (for edit mode)
    React.useEffect(() => {
        if (props.dataInputAppConfig) {
            const config = props.dataInputAppConfig;
            setInputName(config.name ?? '');
            setDataInputType(config.input_type ?? 'kvstore');
            setUrl(config.url ?? 'https://dummyjson.com/products');
            setHttpHeaders(config.http_headers ?? ['']);
            setCronExpression(config.cron_expression ?? '0 * * * *');
            setSelectedCollection(config.selected_output_location ?? '');
            setMode(config.mode ?? 'overwrite');
            setSeparateArrayPaths(config.separate_array_paths ?? []);
            setJsonPathValues(
                config.excluded_json_paths && config.excluded_json_paths.length > 0
                    ? config.excluded_json_paths
                    : ['']
            );
        }
    }, [props.dataInputAppConfig]);

    // Register the addExcludePath function with the parent
    React.useEffect(() => {
        if (props.onAddExcludePathRef) {
            props.onAddExcludePathRef((path: string) => {
                setJsonPathValues((prev) => {
                    // Don't add duplicates
                    if (prev.includes(path)) return prev;
                    // If first row is empty, replace it; otherwise add new row
                    const updated = prev[0] === '' ? [path] : [...prev, path];
                    props.onJSONPathsChange(updated.filter(Boolean));
                    updateConfigField('excluded_json_paths', updated.filter(Boolean));
                    return updated;
                });
            });
        }
    }, [props.onAddExcludePathRef]);

    // Add new JSONPath row
    const handleNewJsonPathExclusion = () => {
        setJsonPathValues((prev) => {
            const updated = [...prev, ""];
            props.onJSONPathsChange(updated.filter(Boolean));
            updateConfigField('excluded_json_paths', updated.filter(Boolean));
            return updated;
        });
    };

    // Remove a JSONPath row by index
    const handleRemoveJsonPathRow = (index: number) => {
        if (index === 0) return; // Prevent removing the first row
        setJsonPathValues((prev) => {
            if (prev.length === 1) return prev; // Prevent removing the last row
            const updated = prev.filter((_, i) => i !== index);
            props.onJSONPathsChange(updated.filter(Boolean));
            updateConfigField('excluded_json_paths', updated.filter(Boolean));
            return updated;
        });
    };

    // Handle Text value change in a row (accept value: string)
    const handleJsonPathTextChange = (value: string, { index }: { index: number }) => {
        setJsonPathValues((prev) => {
            const updated = prev.map((v, i) => (i === index ? value : v));
            props.onJSONPathsChange(updated.filter(Boolean));
            updateConfigField('excluded_json_paths', updated.filter(Boolean));
            return updated;
        });
    };

    // Render controlled rows with inline layout
    const controlledJsonPathRows = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {jsonPathValues.map((value, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Text
                        style={{ width: '80%', fontSize: '1.1em' }}
                        placeholder="e.g. $.bar[*].baz"
                        value={value}
                        onChange={(_, { value }) => handleJsonPathTextChange(value, { index: i })}
                    />
                    {i !== 0 && (
                        <Button
                            inline
                            appearance="secondary"
                            onClick={() => handleRemoveJsonPathRow(i)}
                            label=""
                            icon={<TrashCanCross />}
                            style={{ flexShrink: 0 }}
                        />
                    )}
                </div>
            ))}
            <Button
                appearance="secondary"
                onClick={handleNewJsonPathExclusion}
                style={{ width: '100%' }}
            >
                Add Exclude JSONPath
            </Button>
        </div>
    );

    // Add new HTTP header row
    const handleNewHttpHeader = () => {
        setHttpHeaders((prev) => [...prev, ""]);
    };

    // Remove an HTTP header row by index
    const handleRemoveHttpHeader = (index: number) => {
        if (index === 0) return; // Prevent removing the first row
        setHttpHeaders((prev) => {
            if (prev.length === 1) return prev;
            return prev.filter((_, i) => i !== index);
        });
    };

    // Handle Text value change in a header row
    const handleHttpHeaderTextChange = (value: string, { index }: { index: number }) => {
        setHttpHeaders((prev) => {
            const updated = prev.map((v, i) => (i === index ? value : v));
            updateConfigField('http_headers', updated.filter(Boolean));
            return updated;
        });
    };

    // Render controlled rows for HTTP headers with inline layout
    const controlledHttpHeaderRows = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {http_headers.map((value, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Text
                        style={{ fontSize: '1.1em', width: '80%' }}
                        placeholder="Header: Value"
                        value={value}
                        onChange={(_, { value }) => handleHttpHeaderTextChange(value, { index: i })}
                    />
                    {i !== 0 && (
                        <Button
                            inline
                            appearance="secondary"
                            onClick={() => handleRemoveHttpHeader(i)}
                            label=""
                            icon={<TrashCanCross />}
                            style={{ flexShrink: 0 }}
                        />
                    )}
                </div>
            ))}
            <Button
                appearance="secondary"
                onClick={handleNewHttpHeader}
                style={{ width: '100%' }}
            >
                Add HTTP Header
            </Button>
        </div>
    );

    // Collect JSONPath values from all Text fields in rows
    const getPaths = () => jsonPathValues.filter(Boolean);
    const handleOnCreateCollection = async (createdCollectionName: string, appName: string, fields: string[]) => {
        try {
            // Create the KVStore collection on the backend
            await createNewKVStoreCollection(createdCollectionName, appName, fields);
            
            // Optimistically add the new collection to the list immediately
            setCollectionNames(prev => {
                const newCollection = { name: createdCollectionName, app: appName };
                const exists = prev.some(c => c.name === createdCollectionName && c.app === appName);
                if (exists) return prev;
                return [...prev, newCollection].sort((a, b) => a.name.localeCompare(b.name));
            });
            const selectedOutput = generateSelectedOutputString(appName, createdCollectionName);
            setSelectedCollection(selectedOutput);
            updateConfigField('selected_output_location', selectedOutput);

            // Refresh the list from the server in the background
            getAllCollectionNames().then(names => {
                setCollectionNames(names);
            });
        } catch (error) {
            props.setError(error instanceof Error ? error.message : 'Failed to create KV Store collection');
        }
    };

    // Function to clear all input fields
    const clearInputs = () => {
        setInputName('');
        setDataInputType('kvstore');
        setUrl('https://dummyjson.com/products');
        setCronExpression('0 * * * *');
        setSelectedCollection('');
        setMode('overwrite');
        setJsonPathValues([""]);
        setHttpHeaders([""]);
        setSeparateArrayPaths([]);
        props.onJSONPathsChange([]);
        props.setJsonPreview && props.setJsonPreview('')
    };

    return (
        <div style={{ maxWidth: '900px', width: '100%', padding: '0' }}>
            {/* Basic Configuration Section */}
            <Heading level={2} style={{ marginTop: '0', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #ccc' }}>
                Basic Configuration
            </Heading>

            <ControlGroup label="Input Name" required labelPosition="top" style={{ marginBottom: '20px' }}>
                <Text
                    value={name}
                    onChange={(_, { value }) => {
                        updateConfigField('name', value);
                        setInputName(value)
                    }}
                    placeholder="Enter input name"
                    required
                    canClear
                    style={{ width: '100%' }}
                />
            </ControlGroup>

            <ControlGroup label="API URL" required labelPosition="top" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <Text
                        value={url}
                        onChange={(_, { value }) => {updateConfigField('url', value); setUrl(value)}}
                        disabled={props.loading}
                        canClear
                        required
                        style={{ width: '60%'}}
                    />
                    <Button
                        type="submit"
                        disabled={props.loading}
                        onClick={() => props.fetchDataPreview(url, getPaths(), http_headers)}
                        style={{ minWidth: '140px' }}
                    >
                        {props.loading ? <WaitSpinner size="medium" /> : "Fetch"}
                    </Button>
                </div>
            </ControlGroup>

            <ControlGroup label="HTTP Headers" labelPosition="top" tooltip="Add one or more HTTP headers in the format 'Header: Value'" style={{ marginBottom: '20px' }}>
                {controlledHttpHeaderRows}
            </ControlGroup>

            {/* Splunk Configuration Section */}
            <Heading level={2} style={{ marginTop: '40px', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #ccc' }}>
                Splunk Configuration
            </Heading>

            <ControlGroup label="Cron Expression" required labelPosition="top" tooltip="Cron expression for scheduling data input" style={{ marginBottom: '20px' }}>
                <Text
                    value={cronExpression}
                    onChange={(_, { value }) => {updateConfigField('cron_expression', value); setCronExpression(value)}}
                    placeholder="0 * * * *"
                    required
                    style={{ width: '100%' }}
                />
            </ControlGroup>

            <ControlGroup label="Select KVStore Collection" required labelPosition="top" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <Select
                        value={selected_output_location}
                        onChange={(_, { value }) => {
                            updateConfigField('selected_output_location', String(value));
                            setSelectedCollection(String(value));
                        }}
                        filter
                        placeholder="Select a collection..."
                        style={{ width: '60%' }}
                    >
                        {collectionNames.map((collection: KVStoreCollection) => (
                            <Select.Option
                                value={generateSelectedOutputString(collection.app, collection.name)}
                                key={collection.name}
                                label={`${collection.name} (${collection.app})`}
                            />
                        ))}
                    </Select>
                    <Button appearance="secondary" onClick={() => setShowCreateCollectionModal(true)} elementRef={modalToggle} style={{ minWidth: '180px' }}>
                        Create New Collection
                    </Button>   
                </div>
            </ControlGroup>
            <NewKVStoreForm
                open={showCreateCollectionModal}
                onClose={() => setShowCreateCollectionModal(false)}
                onCreate={handleOnCreateCollection}
                modalToggle={modalToggle}
                initialFields={props.fieldsForKvStoreCreation}
            />

            <ControlGroup label="Mode" required labelPosition="top" tooltip="Overwrite will replace all existing data in the collection" style={{ marginBottom: '20px' }}>
                <RadioList value={mode} onChange={(_, { value }) => {
                    updateConfigField('mode', value as DataInputMode);
                    setMode(value as DataInputMode)
                }}>
                    <RadioList.Option value="overwrite">Overwrite</RadioList.Option>
                </RadioList>
            </ControlGroup>

            {/* Data Processing Section */}
            <Heading level={2} style={{ marginTop: '40px', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #ccc' }}>
                Data Processing
            </Heading>
            <Message type="warning" style={{ marginBottom: '20px' }}>
                Note: Separating arrays will add new fields (_source_array, _array_path) to your data. You may need to update the lookup definition to include these fields.
            </Message>
            <ControlGroup label="Exclude JSONPaths" labelPosition="top" tooltip="Provide one or more JSONPath expressions to exclude fields from the JSON." style={{ marginBottom: '20px' }}>
                {controlledJsonPathRows}
            </ControlGroup>

            <ControlGroup label="Separate Arrays as Events" labelPosition="top" tooltip="Select which arrays should be split into separate events. Each array item will become its own event in Splunk." style={{ marginBottom: '20px', fontSize: '0.9em' }}>
                <div style={{ width: '100%' }}>
                   
                    <ArrayFieldSelector
                        data={props.rawData}
                        selectedPaths={separateArrayPaths}
                        onSelectionChange={(paths) => {
                            setSeparateArrayPaths(paths);
                            updateConfigField('separate_array_paths', paths);
                        }}
                    />
                    <Button
                        appearance="secondary"
                        onClick={() => setShowPreviewModal(true)}
                        elementRef={previewModalToggle}
                        disabled={!props.rawData}
                        style={{ marginTop: '12px', width: '100%' }}
                    >
                        Preview Events
                    </Button>
                </div>
            </ControlGroup>

            <EventPreviewModal
                open={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                data={props.rawData}
                separateArrayPaths={separateArrayPaths}
                excludedJsonPaths={jsonPathValues.filter(Boolean)}
                modalToggle={previewModalToggle}
            />

            {/* assume if dataInputAppConfig is passed in save logic is being handled else where (edit mode) */}
            {!props.dataInputAppConfig && (
                <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
                    <Button
                        appearance="primary"
                        onClick={() => {
                            props.handleSave(
                                {
                                    name,
                                    input_type: dataInputType,
                                    url,
                                    http_headers,
                                    excluded_json_paths: getPaths(),
                                    enabled: true,
                                    cron_expression: cronExpression,
                                    selected_output_location: selected_output_location,
                                    mode,
                                    separate_array_paths: separateArrayPaths
                                } as DataInputAppConfig, clearInputs
                            );
                        }}
                        style={{ width: '100%' }}
                    >
                        Save Data Input
                    </Button>
                </div>
            )}
        </div>
    );
};

export default KVStoreDataForm
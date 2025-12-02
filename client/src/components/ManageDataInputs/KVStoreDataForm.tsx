import ControlGroup from '@splunk/react-ui/ControlGroup';
import React, { useState } from 'react';
import Text from '@splunk/react-ui/Text';
import type { DataInputAppConfig, DataInputMode } from './DataInputs.types';
import Select from '@splunk/react-ui/Select';
import Button from '@splunk/react-ui/Button';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import { getAllCollectionNames, type KVStoreCollection } from '../../utils/splunk';
import NewKVStoreForm from '../DataInputs/KVStore/NewKVStoreForm';
import { generateSelectedOutputString } from '../../utils/dataInputUtils';
import RadioList from '@splunk/react-ui/RadioList';
import ArrayFieldSelector from '../Json/ArrayFieldSelector';
import EventPreviewModal from '../Json/EventPreviewModal';
import FormRowsManager from '../Common/FormRowsManager';
import FormSection from '../Common/FormSection';


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

    // Handle changes to JSONPath values
    const handleJsonPathValuesChange = (values: string[]) => {
        setJsonPathValues(values);
        props.onJSONPathsChange(values.filter(Boolean));
        updateConfigField('excluded_json_paths', values.filter(Boolean));
    };

    // Handle changes to HTTP headers
    const handleHttpHeadersChange = (values: string[]) => {
        setHttpHeaders(values);
        updateConfigField('http_headers', values.filter(Boolean));
    };

    // Collect JSONPath values from all Text fields in rows
    const getPaths = () => jsonPathValues.filter(Boolean);
    
    const handleOnCreateCollection = async (createdCollectionName: string, appName: string) => {
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
        props.setJsonPreview?.('');
    };

    return (
        <div>
            {/* Basic Configuration Section */}
            <FormSection title="Basic Configuration" marginTop="0">
                <ControlGroup label="Input Name:" required>
                    <Text
                        value={name}
                        onChange={(_, { value }) => {
                            updateConfigField('name', value);
                            setInputName(value)
                        }}
                        placeholder="Enter input name"
                        required
                        canClear
                    />
                </ControlGroup>

                <ControlGroup label="API URL:" required>
                    <Text
                        value={url}
                        onChange={(_, { value }) => {updateConfigField('url', value); setUrl(value)}}
                        disabled={props.loading}
                        canClear
                        required
                    />
                    <Button
                        type="submit"
                        disabled={props.loading}
                        onClick={() => props.fetchDataPreview(url, getPaths(), http_headers)}
                    >
                        {props.loading ? <WaitSpinner size="medium" /> : "Fetch"}
                    </Button>
                </ControlGroup>

                <ControlGroup label="HTTP Headers" tooltip="Add one or more HTTP headers in the format 'Header: Value'">
                    <FormRowsManager
                        values={http_headers}
                        onChange={handleHttpHeadersChange}
                        placeholder="Header: Value"
                        addLabel="Add HTTP Header"
                    />
                </ControlGroup>
            </FormSection>

            {/* Splunk Configuration Section */}
            <FormSection title="Splunk Configuration">
                <ControlGroup label="Cron Expression:" required tooltip="Cron expression for scheduling data input">
                    <Text
                        value={cronExpression}
                        onChange={(_, { value }) => {updateConfigField('cron_expression', value); setCronExpression(value)}}
                        placeholder="0 * * * *"
                        required
                    />
                </ControlGroup>

                <ControlGroup label="Select KVStore Collection:" required>
                    <Select
                        value={selected_output_location}
                        onChange={(_, { value }) => {
                            updateConfigField('selected_output_location', String(value));
                            setSelectedCollection(String(value));
                        }}
                        filter
                        placeholder="Select a collection..."
                        style={{ flex: 1, minWidth: '400px' }}
                    >
                        {collectionNames.map((collection: KVStoreCollection) => (
                            <Select.Option
                                value={generateSelectedOutputString(collection.app, collection.name)}
                                key={collection.name}
                                label={`${collection.name} (${collection.app})`}
                            />
                        ))}
                    </Select>
                    <Button appearance="secondary" onClick={() => setShowCreateCollectionModal(true)} elementRef={modalToggle}>
                        Create New Collection
                    </Button>
                </ControlGroup>
                <NewKVStoreForm
                    open={showCreateCollectionModal}
                    onClose={() => setShowCreateCollectionModal(false)}
                    onCreate={handleOnCreateCollection}
                    modalToggle={modalToggle}
                    initialFields={props.fieldsForKvStoreCreation}
                />

                <ControlGroup label="Mode:" required tooltip="Overwrite will replace all existing data in the collection">
                    <RadioList value={mode} onChange={(_, { value }) => {
                        updateConfigField('mode', value as DataInputMode);
                        setMode(value as DataInputMode)
                    }}>
                        <RadioList.Option value="overwrite">Overwrite</RadioList.Option>
                    </RadioList>
                </ControlGroup>
            </FormSection>

            {/* Data Processing Section */}
            <FormSection title="Data Processing">
                <ControlGroup label="Exclude JSONPaths" tooltip="Provide one or more JSONPath expressions to exclude fields from the JSON.">
                    <FormRowsManager
                        values={jsonPathValues}
                        onChange={handleJsonPathValuesChange}
                        placeholder="e.g. $.bar[*].baz"
                        addLabel="Add Exclude JSONPath"
                    />
                </ControlGroup>

                <ControlGroup label="Separate Arrays as Events" tooltip="Select which arrays should be split into separate events. Each array item will become its own event in Splunk.">
                    <div style={{ width: '100%' }}>
                        <ArrayFieldSelector
                            data={props.rawData}
                            selectedPaths={separateArrayPaths}
                            onSelectionChange={(paths) => {
                                setSeparateArrayPaths(paths);
                                updateConfigField('separate_array_paths', paths);
                            }}
                        />
                        {!!props.rawData && (
                            <Button
                                appearance="secondary"
                                onClick={() => setShowPreviewModal(true)}
                                elementRef={previewModalToggle}
                                style={{ marginTop: '12px' }}
                            >
                                Preview Events
                            </Button>
                        )}
                    </div>
                </ControlGroup>

                <EventPreviewModal
                    open={showPreviewModal}
                    onClose={() => setShowPreviewModal(false)}
                    data={props.rawData}
                    separateArrayPaths={separateArrayPaths}
                    modalToggle={previewModalToggle}
                />
            </FormSection>

            <br />
            {/* assume if dataInputAppConfig is passed in save logic is being handled else where (edit mode) */}
            {!props.dataInputAppConfig && (
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
                >
                    Save Data Input
                </Button>
            )}
        </div>
    );
};

export default KVStoreDataForm
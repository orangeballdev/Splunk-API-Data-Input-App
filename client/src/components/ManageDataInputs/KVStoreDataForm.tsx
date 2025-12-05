import Button from '@splunk/react-ui/Button';
import Heading from '@splunk/react-ui/Heading';
import Message from '@splunk/react-ui/Message';
import RadioList from '@splunk/react-ui/RadioList';
import Select from '@splunk/react-ui/Select';
import Text from '@splunk/react-ui/Text';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import React, { useState } from 'react';
import { generateSelectedOutputString } from '../../utils/dataInputUtils';
import { createNewKVStoreCollection, getAllCollectionNames, type KVStoreCollection } from '../../utils/splunk';
import FormField from '../common/FormField';
import FormSection from '../common/FormSection';
import KeyMappingList from '../common/KeyMappingList';
import TextInputList from '../common/TextInputList';
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
    onAddKeyMappingRef?: (fn: (oldKey: string, newKey: string) => void) => void;
    onKeyMappingsChange?: (mappings: Record<string, string>) => void;
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
    const [keyMappings, setKeyMappings] = useState<Record<string, string>>(config.key_mappings ?? {});


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
        getAllCollectionNames().then(setCollectionNames);
    }, []);

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
            setKeyMappings(config.key_mappings ?? {});
            setJsonPathValues(
                config.excluded_json_paths && config.excluded_json_paths.length > 0
                    ? config.excluded_json_paths
                    : ['']
            );
        }
    }, [props.dataInputAppConfig]);

    React.useEffect(() => {
        if (props.onAddExcludePathRef) {
            props.onAddExcludePathRef((path: string) => {
                setJsonPathValues((prev) => {
                    if (prev.includes(path)) return prev;
                    const updated = prev[0] === '' ? [path] : [...prev, path];
                    props.onJSONPathsChange(updated.filter(Boolean));
                    updateConfigField('excluded_json_paths', updated.filter(Boolean));
                    return updated;
                });
            });
        }
    }, [props.onAddExcludePathRef]);

    React.useEffect(() => {
        if (props.onAddKeyMappingRef) {
            props.onAddKeyMappingRef((oldKey: string, newKey: string) => {
                setKeyMappings(prev => {
                    const updated = { ...prev, [oldKey]: newKey };
                    updateConfigField('key_mappings', updated);
                    if (props.onKeyMappingsChange) {
                        props.onKeyMappingsChange(updated);
                    }
                    return updated;
                });
            });
        }
    }, [props.onAddKeyMappingRef]);

    const handleJsonPathsChange = (values: string[]) => {
        setJsonPathValues(values);
        const filtered = values.filter(Boolean);
        props.onJSONPathsChange(filtered);
        updateConfigField('excluded_json_paths', filtered);
    };

    const handleHttpHeadersChange = (values: string[]) => {
        setHttpHeaders(values);
        updateConfigField('http_headers', values.filter(Boolean));
    };

    const handleKeyMappingsChange = (mappings: Record<string, string>) => {
        setKeyMappings(mappings);
        updateConfigField('key_mappings', mappings);
        if (props.onKeyMappingsChange) {
            props.onKeyMappingsChange(mappings);
        }
    };

    const getPaths = () => jsonPathValues.filter(Boolean);
    const handleOnCreateCollection = async (createdCollectionName: string, appName: string, fields: string[]) => {
        try {
            await createNewKVStoreCollection(createdCollectionName, appName, fields);
            
            setCollectionNames(prev => {
                const newCollection = { name: createdCollectionName, app: appName };
                const exists = prev.some(c => c.name === createdCollectionName && c.app === appName);
                if (exists) return prev;
                return [...prev, newCollection].sort((a, b) => a.name.localeCompare(b.name));
            });
            const selectedOutput = generateSelectedOutputString(appName, createdCollectionName);
            setSelectedCollection(selectedOutput);
            updateConfigField('selected_output_location', selectedOutput);

            getAllCollectionNames().then(setCollectionNames);
        } catch (error) {
            props.setError(error instanceof Error ? error.message : 'Failed to create KV Store collection');
        }
    };

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
        setKeyMappings({});
        props.onJSONPathsChange([]);
        props.setJsonPreview?.('')
    };

    return (
        <div style={{ width: '100%', padding: '0' }}>
            <div data-tour="basic-config" style={{ marginBottom: '20px' }}>
                <Heading level={2} style={{ marginTop: '0', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #ccc' }}>
                    Basic Configuration
                </Heading>

            <FormField label="Input Name" required>
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
            </FormField>

            <FormField label="API URL" required>
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
                        data-tour="fetch-button"
                        type="submit"
                        disabled={props.loading}
                        onClick={() => props.fetchDataPreview(url, getPaths(), http_headers)}
                        style={{ minWidth: '140px' }}
                    >
                        {props.loading ? <WaitSpinner size="medium" /> : "Fetch"}
                    </Button>
                </div>
            </FormField>

            <FormField label="HTTP Headers" tooltip="Add one or more HTTP headers in the format 'Header: Value'">
                <TextInputList
                    values={http_headers}
                    placeholder="Header: Value"
                    buttonLabel="Add HTTP Header"
                    onChange={handleHttpHeadersChange}
                />
            </FormField>
            </div>

            <FormSection data-tour="splunk-config" title="Splunk Configuration">
                <FormField label="Cron Expression" required tooltip="Cron expression for scheduling data input">
                    <Text
                        value={cronExpression}
                        onChange={(_, { value }) => {updateConfigField('cron_expression', value); setCronExpression(value)}}
                        placeholder="0 * * * *"
                        required
                        style={{ width: '100%' }}
                    />
                </FormField>

                <FormField label="Select KVStore Collection" required>
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
                </FormField>

                <NewKVStoreForm
                    open={showCreateCollectionModal}
                    onClose={() => setShowCreateCollectionModal(false)}
                    onCreate={handleOnCreateCollection}
                    modalToggle={modalToggle}
                    initialFields={props.fieldsForKvStoreCreation}
                />

                <FormField label="Mode" required tooltip="Choose how data should be written to the collection">
                    <RadioList value={mode} onChange={(_, { value }) => {
                        updateConfigField('mode', value as DataInputMode);
                        setMode(value as DataInputMode)
                    }}>
                        <RadioList.Option value="overwrite">Overwrite</RadioList.Option>
                        <RadioList.Option value="append">Append</RadioList.Option>
                    </RadioList>
                </FormField>
            </FormSection>

            <FormSection data-tour="data-processing" title="Data Processing">
                <Message type="warning" style={{ marginBottom: '20px' }}>
                    Note: Separating arrays will add new fields (_source_array, _array_path) to your data. You may need to update the lookup definition to include these fields.
                </Message>

                <FormField label="Exclude JSONPaths" tooltip="Provide one or more JSONPath expressions to exclude fields from the JSON.">
                    <TextInputList
                        values={jsonPathValues}
                        placeholder="e.g. $.bar[*].baz"
                        buttonLabel="Add Exclude JSONPath"
                        onChange={handleJsonPathsChange}
                    />
                </FormField>

                <FormField label="Rename Keys">
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                        Use JSONPath expressions to rename specific keys (e.g., $.user.name, $.items[*].title). Click on keys in the preview to rename them.
                    </div>
                    <KeyMappingList
                        mappings={keyMappings}
                        onChange={(updated) => {
                            const filtered = Object.fromEntries(
                                Object.entries(updated).filter(([key, value]) => key && value)
                            );
                            handleKeyMappingsChange(filtered);
                        }}
                    />
                </FormField>

                <FormField label="Separate Arrays as Events" tooltip="Select which arrays should be split into separate events. Each array item will become its own event in Splunk.">
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
                </FormField>
            </FormSection>

            <EventPreviewModal
                open={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                data={props.rawData}
                separateArrayPaths={separateArrayPaths}
                excludedJsonPaths={jsonPathValues.filter(Boolean)}
                keyMappings={keyMappings}
                modalToggle={previewModalToggle}
            />

            {!props.dataInputAppConfig && (
                <div style={{ marginTop: '32px', paddingTop: '20px', borderBottom: '1px solid #e0e0e0' }}>
                    <Button
                        data-tour="save-button"
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
                                    separate_array_paths: separateArrayPaths,
                                    key_mappings: keyMappings
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
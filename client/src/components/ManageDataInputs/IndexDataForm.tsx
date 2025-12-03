import TrashCanCross from '@splunk/react-icons/TrashCanCross';
import Button from '@splunk/react-ui/Button';
import Heading from '@splunk/react-ui/Heading';
import Select from '@splunk/react-ui/Select';
import Text from '@splunk/react-ui/Text';
import Typography from '@splunk/react-ui/Typography';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import React, { useState } from 'react';
import { getAllIndexNames } from '../../utils/splunk';
import CreateNewIndex from '../DataInputs/Index/CreateNewIndex';
import ArrayFieldSelector from '../Json/ArrayFieldSelector';
import EventPreviewModal from '../Json/EventPreviewModal';
import type { DataInputAppConfig, DataInputMode } from './DataInputs.types';


interface IndexDataFormProps {
    dataInputAppConfig?: DataInputAppConfig;
    setDataInputAppConfig?: React.Dispatch<React.SetStateAction<DataInputAppConfig>>;
    fetchDataPreview: (url: string, jsonPaths: string[], httpHeaders?: string[]) => Promise<void>;
    loading: boolean;
    handleSave: (formData: DataInputAppConfig, clearInputs?: () => void) => void;
    setError: (message: string) => void;
    onJSONPathsChange: (jsonPaths: string[]) => void;
    setJsonPreview?: (data: string) => void;
    onAddExcludePathRef?: (fn: (path: string) => void) => void;
    rawData?: unknown;
}

const IndexDataForm: React.FC<IndexDataFormProps> = (props) => {
    const config: Partial<DataInputAppConfig> = props.dataInputAppConfig || {};
    const modalToggle = React.useRef<HTMLButtonElement | null>(null);
    const previewModalToggle = React.useRef<HTMLButtonElement | null>(null);
    const [indexNames, setIndexNames] = useState<string[]>([]);
    const [showCreateIndexModal, setShowCreateIndexModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const [name, setInputName] = useState(config.name ?? '');
    const [dataInputType] = useState<string>('index');
    const [url, setUrl] = useState(config.url ?? "https://dummyjson.com/products");
    const [http_headers, setHttpHeaders] = useState<string[]>(config.http_headers ?? [""]);
    const [cronExpression, setCronExpression] = useState(config.cron_expression ?? '0 * * * *');
    const [selected_output_location, setSelectedIndex] = useState<string>(config.selected_output_location ?? '');
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
        getAllIndexNames().then(result => {
            setIndexNames(result);
        });
    }, []);

    // Sync form state when dataInputAppConfig changes (for edit mode)
    React.useEffect(() => {
        if (props.dataInputAppConfig) {
            const config = props.dataInputAppConfig;
            setInputName(config.name ?? '');
            setUrl(config.url ?? 'https://dummyjson.com/products');
            setHttpHeaders(config.http_headers ?? ['']);
            setCronExpression(config.cron_expression ?? '0 * * * *');
            setSelectedIndex(config.selected_output_location ?? '');
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
                        style={{  fontSize: '1.1em', width: '80%' }}
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
    // Function to clear all input fields
    const clearInputs = () => {
        setInputName('');
        setUrl('https://dummyjson.com/products');
        setCronExpression('0 * * * *');
        setSelectedIndex('');
        setMode('overwrite');
        setJsonPathValues([""]);
        setHttpHeaders([""]);
        setSeparateArrayPaths([]);
        props.onJSONPathsChange([]);
        props.setJsonPreview && props.setJsonPreview('')
    };

    const handleOnCreateIndex = async (createdIndexName: string) => {
        // Optimistically add the new index to the list immediately
        setIndexNames(prev => {
            if (prev.includes(createdIndexName)) return prev;
            return [...prev, createdIndexName].sort();
        });
        setSelectedIndex(createdIndexName);
        updateConfigField('selected_output_location', createdIndexName);

        // Refresh the list from the server in the background
        getAllIndexNames().then(names => {
            setIndexNames(names);
        });
    };

    return (
        <div style={{ width: '100%', padding: '0' }}>
            {/* Basic Configuration Section */}
            <Heading level={2} style={{ marginTop: '0', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #ccc' }}>
                Basic Configuration
            </Heading>
            
            <div style={{ marginBottom: '20px', width: '100%' }}>
                <Typography as="span" variant="body" weight="semiBold" style={{ display: 'block', marginBottom: '8px' }}>
                    Input Name <span style={{ color: 'red' }}>*</span>
                </Typography>
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
            </div>

            <div style={{ marginBottom: '20px', width: '100%' }}>
                <Typography as="span" variant="body" weight="semiBold" style={{ display: 'block', marginBottom: '8px' }}>
                    API URL <span style={{ color: 'red' }}>*</span>
                </Typography>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <Text
                        value={url}
                        onChange={(_, { value }) => {updateConfigField('url', value); setUrl(value)}}
                        disabled={props.loading}
                        canClear
                        required
                        style={{ width: '60%' }}
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
            </div>

            <div style={{ marginBottom: '20px', width: '100%' }}>
                <Typography as="span" variant="body" weight="semiBold" style={{ display: 'block', marginBottom: '8px' }} title="Add one or more HTTP headers in the format 'Header: Value'">
                    HTTP Headers
                </Typography>
                {controlledHttpHeaderRows}
            </div>

            {/* Splunk Configuration Section */}
            <Heading level={2} style={{ marginTop: '40px', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #ccc' }}>
                Splunk Configuration
            </Heading>

            <div style={{ marginBottom: '20px', width: '100%' }}>
                <Typography as="span" variant="body" weight="semiBold" style={{ display: 'block', marginBottom: '8px' }} title="Cron expression for scheduling data input">
                    Cron Expression <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Text
                    value={cronExpression}
                    onChange={(_, { value }) => {updateConfigField('cron_expression', value); setCronExpression(value)}}
                    placeholder="0 * * * *"
                    required
                    style={{ width: '100%' }}
                />
            </div>

            <div style={{ marginBottom: '20px', width: '100%' }}>
                <Typography as="span" variant="body" weight="semiBold" style={{ display: 'block', marginBottom: '8px' }}>
                    Select Index <span style={{ color: 'red' }}>*</span>
                </Typography>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <Select
                        value={selected_output_location}
                        onChange={(_, { value }) => {updateConfigField('selected_output_location', String(value)); setSelectedIndex(String(value))}}
                        filter
                        placeholder="Select an index..."
                        style={{ width: '60%' }}
                    >
                        {indexNames.map((indexName) => (
                            <Select.Option value={indexName} key={indexName} label={indexName} />
                        ))}
                    </Select>
                    <Button appearance="secondary" onClick={() => setShowCreateIndexModal(true)} elementRef={modalToggle} style={{ minWidth: '180px' }}>
                        Create New Index
                    </Button>
                </div>
            </div>
            <CreateNewIndex
                open={showCreateIndexModal}
                onClose={() => setShowCreateIndexModal(false)}
                onCreate={handleOnCreateIndex}
                modalToggle={modalToggle}
            />

            {/* Data Processing Section */}
            <Heading level={2} style={{ marginTop: '40px', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #ccc' }}>
                Data Processing
            </Heading>

            <div style={{ marginBottom: '20px', width: '100%' }}>
                <Typography as="span" variant="body" weight="semiBold" style={{ display: 'block', marginBottom: '8px' }} title="Provide one or more JSONPath expressions to exclude fields from the JSON.">
                    Exclude JSONPaths
                </Typography>
                {controlledJsonPathRows}
            </div>

            <div style={{ marginBottom: '20px', width: '100%' }}>
                <Typography as="span" variant="body" weight="semiBold" style={{ display: 'block', marginBottom: '8px' }} title="Select which arrays should be split into separate events. Each array item will become its own event in Splunk.">
                    Separate Arrays as Events
                </Typography>
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
            </div>

            <EventPreviewModal
                open={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                data={props.rawData}
                separateArrayPaths={separateArrayPaths}
                excludedJsonPaths={jsonPathValues.filter(Boolean)}
                modalToggle={previewModalToggle}
            />

            {/* assume if dataInputAppConfig is passed in save logic is being handled elsewhere (edit mode) */}
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

export default IndexDataForm;

import Message from '@splunk/react-ui/Message';
import React, { useEffect, useMemo, useRef, useState } from "react";

import { fetchDataPreview as fetchDataPreviewUtil } from "../../../utils/apiFetch";
import { addNewDataInputToKVStore } from "../../../utils/dataInputUtils";
import { removeByJsonPaths } from '../../Json/utils';

import type { JSONElement } from "@splunk/react-ui/JSONTree";
import type { DataInputAppConfig } from "../../ManageDataInputs/DataInputs.types";
import KVStoreDataForm from "../../ManageDataInputs/KVStoreDataForm";


interface NewKVStoreDataInputFormProps {
  dataInputAppConfig?: DataInputAppConfig;
    setDataInputAppConfig?: React.Dispatch<React.SetStateAction<DataInputAppConfig>>;
  onDataFetched?: (data: string) => void;
  onSuccess?: () => void;
  onAddExcludePathRef?: (fn: (path: string) => void) => void;
  onAddKeyMappingRef?: (fn: (oldKey: string, newKey: string) => void) => void;
  onKeyMappingsChange?: (mappings: Record<string, string>) => void;
}

const NewKVStoreDataInputForm: React.FC<NewKVStoreDataInputFormProps> = ({ dataInputAppConfig, setDataInputAppConfig, onDataFetched, onSuccess, onAddExcludePathRef, onAddKeyMappingRef, onKeyMappingsChange }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Store the last fetched data so we can re-filter it when JSONPaths change
  const [rawData, setRawData] = useState<JSONElement | null>(null);
  const [filteredData, setFilteredData] = useState<JSONElement | null>({});

  const initialFields = useMemo(() => {
    if (filteredData && Object.keys(filteredData).length > 0) {
      return Object.keys(filteredData);
    } else if (rawData && Object.keys(rawData).length > 0) {
      return Object.keys(rawData);
    } else {
      return [];
    }
  }, [filteredData, rawData]);
  
  const onJSONPathsChange = (jsonPaths: string[]) => {
    if (!rawData) return;
    const filtered = jsonPaths.length ? removeByJsonPaths(rawData, jsonPaths) : rawData;
    setFilteredData(filtered);
    if (onDataFetched) onDataFetched(JSON.stringify(filtered));
  }

  async function fetchDataPreview(url: string, jsonPaths: string[], httpHeaders: string[] = []) {
    await fetchDataPreviewUtil(url, jsonPaths, httpHeaders, setRawData, onDataFetched, setError, setLoading);
  }

  // Save Data Input handler
  const handleSaveDataInput = async (formData: DataInputAppConfig, clearInputs?: () => void) => {
    if (!formData.name || !formData.url || !formData.input_type || !formData.cron_expression || (formData.input_type === 'kvstore' && !formData.selected_output_location)) {
      setError("Not all required fields are filled out");
      return;
    }

    if (formData.input_type === 'kvstore') {
      try {
        await addNewDataInputToKVStore(formData);
        setError(null);
        if (onSuccess) onSuccess();
        if (clearInputs) clearInputs();
        // Reset rawData to clear the array field selector
        setRawData(null);
        setFilteredData({});
      } catch {
        setError('Failed to save data input to KV Store');
      }
    }
  };

  // Track if we've done the initial fetch
  const hasInitiallyFetchedRef = useRef(false);

  // Fetch initial data when editing an existing input (once when data is available)
  useEffect(() => {
    if (dataInputAppConfig?.url && !hasInitiallyFetchedRef.current) {
      hasInitiallyFetchedRef.current = true;
      const jsonPaths = dataInputAppConfig.excluded_json_paths ?? [];
      const httpHeaders = dataInputAppConfig.http_headers ?? [];
      fetchDataPreview(dataInputAppConfig.url, jsonPaths, httpHeaders);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataInputAppConfig?.url]); // Run when URL becomes available

  return (
    <>
      {error && (
        <Message style={{ marginBottom: "10px" }} appearance="fill" type="error">
          {error}
        </Message>
      )}
      <KVStoreDataForm 
        dataInputAppConfig={dataInputAppConfig} 
        setDataInputAppConfig={setDataInputAppConfig} 
        fetchDataPreview={fetchDataPreview} 
        setJsonPreview={onDataFetched} 
        fieldsForKvStoreCreation={initialFields} 
        loading={loading} 
        handleSave={handleSaveDataInput} 
        setError={setError} 
        onJSONPathsChange={onJSONPathsChange} 
        onAddExcludePathRef={onAddExcludePathRef}
        onAddKeyMappingRef={onAddKeyMappingRef}
        onKeyMappingsChange={onKeyMappingsChange}
        rawData={rawData} 
      />
    </>
  );
};

export default NewKVStoreDataInputForm;

import Message from '@splunk/react-ui/Message';
import React, { useEffect, useRef, useState } from "react";

import { fetchDataPreview as fetchDataPreviewUtil } from "../../../utils/apiFetch";
import { addNewDataInputToIndex } from "../../../utils/dataInputUtils";
import { removeByJsonPaths } from '../../Json/utils';

import type { JSONElement } from "@splunk/react-ui/JSONTree";
import type { DataInputAppConfig } from "../../ManageDataInputs/DataInputs.types";
import IndexDataForm from "../../ManageDataInputs/IndexDataForm";


interface NewIndexDataInputFormProps {
  dataInputAppConfig?: DataInputAppConfig;
  setDataInputAppConfig?: React.Dispatch<React.SetStateAction<DataInputAppConfig>>;
  onDataFetched?: (data: string) => void;
  onSuccess?: () => void;
  onAddExcludePathRef?: (fn: (path: string) => void) => void;
  onAddKeyMappingRef?: (fn: (oldKey: string, newKey: string) => void) => void;
  onKeyMappingsChange?: (mappings: Record<string, string>) => void;
}

const NewIndexDataInputForm: React.FC<NewIndexDataInputFormProps> = ({ dataInputAppConfig, setDataInputAppConfig, onDataFetched, onSuccess, onAddExcludePathRef, onAddKeyMappingRef, onKeyMappingsChange }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Store the last fetched data so we can re-filter it when JSONPaths change
  const [rawData, setRawData] = useState<JSONElement | null>(null);

  const onJSONPathsChange = (jsonPaths: string[]) => {
    if (!rawData) return;
    const filtered = jsonPaths.length ? removeByJsonPaths(rawData, jsonPaths) : rawData;
    if (onDataFetched) onDataFetched(JSON.stringify(filtered));
  }

  async function fetchDataPreview(url: string, jsonPaths: string[], httpHeaders: string[] = []) {
    await fetchDataPreviewUtil(url, jsonPaths, httpHeaders, setRawData, onDataFetched, setError, setLoading);
  }

  // Save Data Input handler
  const handleSaveDataInput = async (formData: DataInputAppConfig, clearInputs?: () => void) => {
    if (!formData.name || !formData.url || !formData.input_type || !formData.cron_expression || !formData.selected_output_location) {
      setError("Not all required fields are filled out");
      return;
    }

    try {
      await addNewDataInputToIndex(formData);
      setError(null);
      if (onSuccess) onSuccess();
      if (clearInputs) clearInputs();
      // Reset rawData to clear the array field selector
      setRawData(null);
    } catch {
      setError('Failed to save data input configuration');
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
      <IndexDataForm
        dataInputAppConfig={dataInputAppConfig}
        setDataInputAppConfig={setDataInputAppConfig}
        fetchDataPreview={fetchDataPreview}
        setJsonPreview={onDataFetched}
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

export default NewIndexDataInputForm;

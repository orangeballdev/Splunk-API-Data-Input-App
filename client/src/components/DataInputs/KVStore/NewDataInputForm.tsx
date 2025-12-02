import React, { useMemo, useState } from "react";
import Message from '@splunk/react-ui/Message';

import { removeByJsonPaths } from '../../Json/utils';
import { addNewDataInputToKVStore } from "../../../utils/dataInputUtils";
import { proxyApiRequest } from "../../../utils/splunk";

import type { JSONElement } from "@splunk/react-ui/JSONTree";
import type { DataInputAppConfig } from "../../ManageDataInputs/DataInputs.types";
import KVStoreDataForm from "../../ManageDataInputs/KVStoreDataForm";


interface NewKVStoreDataInputFormProps {
  dataInputAppConfig?: DataInputAppConfig;
    setDataInputAppConfig?: React.Dispatch<React.SetStateAction<DataInputAppConfig>>;
  onDataFetched?: (data: string) => void;
  onSuccess?: () => void;
  onAddExcludePathRef?: (fn: (path: string) => void) => void;
}

const NewKVStoreDataInputForm: React.FC<NewKVStoreDataInputFormProps> = ({ dataInputAppConfig, setDataInputAppConfig, onDataFetched, onSuccess, onAddExcludePathRef }) => {
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

  /**
   * Parse header string in "Header: Value" format
   */
  function parseHeaders(headerStrings: string[]): Record<string, string> {
    const headers: Record<string, string> = {};
    for (const headerStr of headerStrings) {
      const colonIndex = headerStr.indexOf(':');
      if (colonIndex > 0) {
        const name = headerStr.slice(0, colonIndex).trim();
        const value = headerStr.slice(colonIndex + 1).trim();
        if (name) {
          headers[name] = value;
        }
      }
    }
    return headers;
  }

  /**
   * Get a human-readable error message for HTTP status codes
   */
  function getHttpErrorMessage(status: number, statusText: string): string {
    const messages: Record<number, string> = {
      400: 'Bad Request - The server could not understand the request',
      401: 'Unauthorized - Authentication is required',
      403: 'Forbidden - You do not have permission to access this resource',
      404: 'Not Found - The requested resource does not exist',
      405: 'Method Not Allowed - This HTTP method is not supported',
      408: 'Request Timeout - The server timed out waiting for the request',
      429: 'Too Many Requests - Rate limit exceeded',
      500: 'Internal Server Error - The server encountered an error',
      502: 'Bad Gateway - Invalid response from upstream server',
      503: 'Service Unavailable - The server is temporarily unavailable',
      504: 'Gateway Timeout - Upstream server did not respond in time',
    };
    return messages[status] || statusText || 'Unknown error';
  }

  async function fetchDataPreview(url: string, jsonPaths: string[], httpHeaders: string[] = []) {
    setError(null);
    setLoading(true);
    if (onDataFetched) onDataFetched('');

    try {
      if (!url) throw new Error("Please enter a URL");

      // Validate URL format
      try {
        new URL(url);
      } catch {
        throw new Error(`Invalid URL format: "${url}"`);
      }

      const headers = parseHeaders(httpHeaders);

      // Use the backend proxy to avoid CORS issues
      const proxyResponse = await proxyApiRequest(url, headers, 'GET');

      if (proxyResponse.status_code >= 400) {
        const errorMessage = getHttpErrorMessage(proxyResponse.status_code, '');
        let errorDetails = `HTTP ${proxyResponse.status_code}: ${errorMessage}`;

        // Include server response if available
        if (proxyResponse.data && proxyResponse.data.length < 500) {
          errorDetails += `\n\nServer response: ${proxyResponse.data}`;
        }

        throw new Error(errorDetails);
      }

      const contentType = proxyResponse.content_type;
      if (contentType && !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response but received: ${contentType}`);
      }

      // Parse the JSON data from the proxy response
      const data = JSON.parse(proxyResponse.data);
      setRawData(data as import('@splunk/react-ui/JSONTree').JSONElement);
      const filtered = jsonPaths.length ? removeByJsonPaths(data as import('@splunk/react-ui/JSONTree').JSONElement, jsonPaths) : data;
      if (onDataFetched) onDataFetched(JSON.stringify(filtered));
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON response from server');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
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
      } catch {
        setError('Failed to save data input to KV Store');
      }
    }
  };

  return (
    <>
      {error && (
        <Message style={{ marginBottom: "10px" }} appearance="fill" type="error">
          {error}
        </Message>
      )}
      <KVStoreDataForm dataInputAppConfig={dataInputAppConfig} setDataInputAppConfig={setDataInputAppConfig} fetchDataPreview={fetchDataPreview} setJsonPreview={onDataFetched} fieldsForKvStoreCreation={initialFields} loading={loading} handleSave={handleSaveDataInput} setError={setError} onJSONPathsChange={onJSONPathsChange} onAddExcludePathRef={onAddExcludePathRef} rawData={rawData} />
    </>
  );
};

export default NewKVStoreDataInputForm;

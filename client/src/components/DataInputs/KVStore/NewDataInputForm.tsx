import React, { useMemo, useState } from "react";
import Message from '@splunk/react-ui/Message';

import { addNewDataInputToKVStore } from "../../../utils/dataInputUtils";
import { useDataFetching } from "../../../hooks/useDataFetching";

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

  const { loading, rawData, fetchDataPreview, onJSONPathsChange } = useDataFetching({
    onDataFetched,
    setError
  });

  const initialFields = useMemo(() => {
    if (rawData && Object.keys(rawData).length > 0) {
      return Object.keys(rawData);
    }
    return [];
  }, [rawData]);

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

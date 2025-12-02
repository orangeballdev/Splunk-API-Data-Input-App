import React, { useState } from "react";
import Message from '@splunk/react-ui/Message';

import { addNewDataInputToIndex } from "../../../utils/dataInputUtils";
import { useDataFetching } from "../../../hooks/useDataFetching";

import type { DataInputAppConfig } from "../../ManageDataInputs/DataInputs.types";
import IndexDataForm from "../../ManageDataInputs/IndexDataForm";


interface NewIndexDataInputFormProps {
  dataInputAppConfig?: DataInputAppConfig;
  setDataInputAppConfig?: React.Dispatch<React.SetStateAction<DataInputAppConfig>>;
  onDataFetched?: (data: string) => void;
  onSuccess?: () => void;
  onAddExcludePathRef?: (fn: (path: string) => void) => void;
}

const NewIndexDataInputForm: React.FC<NewIndexDataInputFormProps> = ({ dataInputAppConfig, setDataInputAppConfig, onDataFetched, onSuccess, onAddExcludePathRef }) => {
  const [error, setError] = useState<string | null>(null);

  const { loading, rawData, fetchDataPreview, onJSONPathsChange } = useDataFetching({
    onDataFetched,
    setError
  });

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
    } catch {
      setError('Failed to save data input configuration');
    }
  };

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
        rawData={rawData}
      />
    </>
  );
};

export default NewIndexDataInputForm;

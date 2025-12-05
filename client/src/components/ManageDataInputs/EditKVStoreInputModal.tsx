import Button from '@splunk/react-ui/Button';
import Message from '@splunk/react-ui/Message';
import Modal from '@splunk/react-ui/Modal';
import React, { useEffect, useState } from 'react';
import { getDataInputsConfigById, updateDataInputConfigById } from '../../utils/dataInputUtils';
import type { DataInputAppConfig } from './DataInputs.types';
import EditKVStorePage from './EditKVStorePage';

interface EditKVStoreInputModalProps {
    id?: string;
    open: boolean;
    modalToggle: React.RefObject<HTMLButtonElement | null>;
    onClose: () => void;
    onSuccess?: () => void;

}

const EditKVStoreInputModal: React.FC<EditKVStoreInputModalProps> = ({ id, open, modalToggle, onClose, onSuccess }) => {
    const [data, setData] = useState<DataInputAppConfig>();
    const [error, setError] = useState<string | null>(null);
    const [mountKey, setMountKey] = useState(0);
    
    useEffect(() => {
        async function fetchData() {

            try {
                const result = await getDataInputsConfigById(id || '');
                setError(null);
                setData(result);
            } catch {
                setError('Failed to fetch config');
            }
        }
        if (!id) {
            setError('No ID provided for EditKVStoreInputModal');
            return;
        }

        if (open && id) {
            setMountKey(prev => prev + 1);
            fetchData();
        } else if (!open) {
            // Clear state when modal closes
            setData(undefined);
            setError(null);
        }
    }, [id, open]);


    const handleSave = async () => {
        if (data) {
            try {
                await updateDataInputConfigById(data);
                setError(null);
                if (onSuccess) onSuccess();
                onClose();
            } catch {
                setError('Failed to update config');
            }
        }
    }
    return (
        <Modal
            returnFocus={modalToggle}
            onRequestClose={onClose}
            open={open}
            style={{ width: '90vw', height: '95vh' }}
        >
            <Modal.Header title="Edit KV Store Input" />
            <Modal.Body style={{ height: 'calc(95vh - 120px)', overflow: 'auto', padding: '0' }}>
                {error ? (
                    <Message type="error">{error}</Message>
                ) : data ? (
                    <EditKVStorePage 
                        key={mountKey} 
                        dataInputAppConfig={data} 
                        setDataInputAppConfig={setData as React.Dispatch<React.SetStateAction<DataInputAppConfig>>} 
                        onSuccess={onClose} 
                    />
                ) : null}
            </Modal.Body>
            <Modal.Footer>
                <Button appearance="primary" onClick={handleSave} label="Save" />
                <Button appearance="secondary" onClick={onClose} label="Cancel" />
            </Modal.Footer>
        </Modal>
    );
};

export default EditKVStoreInputModal;
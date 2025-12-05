import Button from '@splunk/react-ui/Button';
import React from 'react';

interface ActionButtonsProps {
    onPreview: () => void;
    previewDisabled: boolean;
    previewRef: React.Ref<HTMLButtonElement>;
    onSave?: () => void;
    saveDataTour?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    onPreview,
    previewDisabled,
    previewRef,
    onSave,
    saveDataTour
}) => {
    return (
        <div style={{ position: 'sticky', bottom: 0, background: 'white', padding: '20px 0', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button
                appearance="secondary"
                onClick={onPreview}
                elementRef={previewRef}
                disabled={previewDisabled}
                style={{ flex: 1, maxWidth: '200px' }}
            >
                Preview Events
            </Button>
            {onSave && (
                <Button
                    data-tour={saveDataTour}
                    appearance="primary"
                    onClick={onSave}
                    style={{ flex: 1, maxWidth: '200px' }}
                >
                    Save Data Input
                </Button>
            )}
        </div>
    );
};

export default ActionButtons;
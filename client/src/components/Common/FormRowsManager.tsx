import React from 'react';
import Text from '@splunk/react-ui/Text';
import Button from '@splunk/react-ui/Button';
import FormRows from '@splunk/react-ui/FormRows';
import TrashCanCross from '@splunk/react-icons/TrashCanCross';

interface FormRowsManagerProps {
    values: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    addLabel?: string;
    minWidth?: string;
    minWidthFirst?: string;
}

/**
 * A reusable component for managing dynamic form rows with add/remove functionality
 */
const FormRowsManager: React.FC<FormRowsManagerProps> = ({
    values,
    onChange,
    placeholder = 'Enter value',
    addLabel = 'Add Row',
    minWidth = '542px',
    minWidthFirst = '577px'
}) => {
    // Add new row
    const handleAddRow = () => {
        onChange([...values, ""]);
    };

    // Remove a row by index
    const handleRemoveRow = (index: number) => {
        if (index === 0) return; // Prevent removing the first row
        if (values.length === 1) return; // Prevent removing the last row
        onChange(values.filter((_, i) => i !== index));
    };

    // Handle Text value change in a row
    const handleTextChange = (value: string, index: number) => {
        onChange(values.map((v, i) => (i === index ? value : v)));
    };

    // Render controlled rows
    const controlledRows = values.map((value, i) => (
        <FormRows.Row index={i} key={i}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexGrow: 1, marginRight: '8px', minWidth: 0 }}>
                    <Text
                        style={{ 
                            width: '100%', 
                            minWidth: i === 0 ? minWidthFirst : minWidth, 
                            fontSize: '1.1em' 
                        }}
                        placeholder={placeholder}
                        value={value}
                        onChange={(_, { value }) => handleTextChange(value, i)}
                    />
                </div>
                {i !== 0 && (
                    <Button
                        inline
                        appearance="secondary"
                        onClick={() => handleRemoveRow(i)}
                        label=""
                        icon={<TrashCanCross />}
                    />
                )}
            </div>
        </FormRows.Row>
    ));

    return (
        <FormRows
            onRequestAdd={handleAddRow}
            addLabel={addLabel}
        >
            {controlledRows}
        </FormRows>
    );
};

export default FormRowsManager;

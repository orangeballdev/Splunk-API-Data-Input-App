import React, { useMemo } from 'react';
import styled from 'styled-components';
import Text from '@splunk/react-ui/Text';
import Button from '@splunk/react-ui/Button';
import Select from '@splunk/react-ui/Select';
import TrashCanCross from '@splunk/react-icons/TrashCanCross';
import type { FieldMapping } from '../ManageDataInputs/DataInputs.types';
import { detectFieldKeys } from './fieldMappingUtils';

interface FieldMappingEditorProps {
    data: unknown;
    mappings: FieldMapping[];
    onMappingsChange: (mappings: FieldMapping[]) => void;
}

const Container = styled.div`
    margin-top: 8px;
`;

const MappingRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0;
    padding: 8px 12px;
    background: #f5f5f5;
    border-radius: 4px;

    &:hover {
        background: #eee;
    }
`;

const Arrow = styled.span`
    color: #666;
    font-size: 18px;
    padding: 0 4px;
`;

const FieldSelect = styled.div`
    flex: 1;
    min-width: 180px;
`;

const NewKeyInput = styled.div`
    flex: 1;
    min-width: 180px;
`;

const NoDataMessage = styled.p`
    color: #666;
    font-style: italic;
    font-size: 13px;
    margin: 8px 0;
`;

const AddButtonContainer = styled.div`
    margin-top: 12px;
`;

const MappingCount = styled.span`
    color: #666;
    font-size: 12px;
    margin-left: 8px;
`;

const FieldMappingEditor: React.FC<FieldMappingEditorProps> = ({
    data,
    mappings,
    onMappingsChange
}) => {
    // Detect available field keys from the data
    const availableKeys = useMemo(() => {
        if (!data) return [];
        return detectFieldKeys(data);
    }, [data]);

    // Filter out already mapped keys for the dropdown
    const getUnmappedKeys = (currentMapping?: FieldMapping) => {
        const mappedKeys = new Set(
            mappings
                .filter(m => m !== currentMapping)
                .map(m => m.originalKey)
        );
        return availableKeys.filter(key => !mappedKeys.has(key));
    };

    const handleAddMapping = () => {
        const unmappedKeys = getUnmappedKeys();
        const newMapping: FieldMapping = {
            originalKey: unmappedKeys[0] || '',
            newKey: ''
        };
        onMappingsChange([...mappings, newMapping]);
    };

    const handleRemoveMapping = (index: number) => {
        const newMappings = mappings.filter((_, i) => i !== index);
        onMappingsChange(newMappings);
    };

    const handleOriginalKeyChange = (index: number, value: string) => {
        const newMappings = mappings.map((m, i) =>
            i === index ? { ...m, originalKey: value } : m
        );
        onMappingsChange(newMappings);
    };

    const handleNewKeyChange = (index: number, value: string) => {
        const newMappings = mappings.map((m, i) =>
            i === index ? { ...m, newKey: value } : m
        );
        onMappingsChange(newMappings);
    };

    if (!data) {
        return (
            <Container>
                <NoDataMessage>Fetch data first to see available fields for renaming</NoDataMessage>
            </Container>
        );
    }

    if (availableKeys.length === 0) {
        return (
            <Container>
                <NoDataMessage>No fields detected in the response</NoDataMessage>
            </Container>
        );
    }

    return (
        <Container>
            {mappings.map((mapping, index) => (
                <MappingRow key={index}>
                    <FieldSelect>
                        <Select
                            value={mapping.originalKey}
                            onChange={(_, { value }) => handleOriginalKeyChange(index, String(value))}
                            filter
                            placeholder="Select original field..."
                        >
                            {/* Show currently selected key plus unmapped keys */}
                            {[...new Set([mapping.originalKey, ...getUnmappedKeys(mapping)])]
                                .filter(Boolean)
                                .map(key => (
                                    <Select.Option
                                        key={key}
                                        value={key}
                                        label={key}
                                    />
                                ))
                            }
                        </Select>
                    </FieldSelect>
                    <Arrow>&rarr;</Arrow>
                    <NewKeyInput>
                        <Text
                            value={mapping.newKey}
                            onChange={(_, { value }) => handleNewKeyChange(index, value)}
                            placeholder="Enter new field name..."
                        />
                    </NewKeyInput>
                    <Button
                        inline
                        appearance="secondary"
                        onClick={() => handleRemoveMapping(index)}
                        icon={<TrashCanCross />}
                        label=""
                    />
                </MappingRow>
            ))}
            <AddButtonContainer>
                <Button
                    appearance="secondary"
                    onClick={handleAddMapping}
                    disabled={getUnmappedKeys().length === 0 && mappings.length > 0}
                >
                    Add Field Mapping
                </Button>
                {mappings.length > 0 && (
                    <MappingCount>
                        {mappings.length} field{mappings.length !== 1 ? 's' : ''} will be renamed
                    </MappingCount>
                )}
            </AddButtonContainer>
        </Container>
    );
};

export default FieldMappingEditor;

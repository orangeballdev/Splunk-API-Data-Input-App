import TrashCanCross from '@splunk/react-icons/TrashCanCross';
import Button from '@splunk/react-ui/Button';
import Text from '@splunk/react-ui/Text';

interface KeyMappingListProps {
    mappings: Record<string, string>;
    onChange: (mappings: Record<string, string>) => void;
}

export default function KeyMappingList({ mappings, onChange }: KeyMappingListProps) {
    // Always ensure at least one empty entry
    const entries = Object.entries(mappings).length > 0 ? Object.entries(mappings) : [['', '']];
    
    const handleAdd = () => {
        // Add a placeholder mapping with empty strings
        onChange({ ...mappings, '': '' });
    };

    const handleRemove = (oldKey: string) => {
        const updated = { ...mappings };
        delete updated[oldKey];
        // If this was the last entry, don't clear it completely - the component will show one empty row
        onChange(updated);
    };

    const handleChangeOldKey = (oldKey: string, newOldKey: string) => {
        if (oldKey === newOldKey) return;
        
        const updated = { ...mappings };
        const value = updated[oldKey];
        delete updated[oldKey];
        
        // Only add if the new key doesn't already exist
        if (!updated.hasOwnProperty(newOldKey)) {
            updated[newOldKey] = value;
        }
        onChange(updated);
    };

    const handleChangeNewKey = (oldKey: string, newValue: string) => {
        onChange({ ...mappings, [oldKey]: newValue });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entries.map(([oldKey, newKey], i) => (
                <div key={oldKey || `empty-${i}`} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Text
                        style={{ flex: '1', fontSize: '1.1em' }}
                        placeholder="Original key name"
                        value={oldKey}
                        onChange={(_, { value }) => handleChangeOldKey(oldKey, value)}
                    />
                    <span style={{ color: '#999', flexShrink: 0 }}>→</span>
                    <Text
                        style={{ flex: '1', fontSize: '1.1em' }}
                        placeholder="New key name"
                        value={newKey}
                        onChange={(_, { value }) => handleChangeNewKey(oldKey, value)}
                    />
                    {(i !== 0 || entries.length > 1) && (
                        <Button
                            inline
                            appearance="secondary"
                            onClick={() => handleRemove(oldKey)}
                            label=""
                            icon={<TrashCanCross />}
                            style={{ flexShrink: 0 }}
                        />
                    )}
                </div>
            ))}
            <Button 
                appearance="secondary" 
                onClick={handleAdd} 
                style={{ width: '100%' }}
                disabled={entries.some(([oldKey, newKey]) => oldKey === '' || newKey === '')}
            >
                Add Key Mapping
            </Button>
        </div>
    );
}

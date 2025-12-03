import TrashCanCross from '@splunk/react-icons/TrashCanCross';
import Button from '@splunk/react-ui/Button';
import Text from '@splunk/react-ui/Text';

interface TextInputListProps {
    values: string[];
    placeholder: string;
    buttonLabel: string;
    onChange: (values: string[]) => void;
}

export default function TextInputList({ values, placeholder, buttonLabel, onChange }: TextInputListProps) {
    const handleAdd = () => {
        onChange([...values, ""]);
    };

    const handleRemove = (index: number) => {
        if (index === 0 || values.length === 1) return;
        onChange(values.filter((_, i) => i !== index));
    };

    const handleChange = (value: string, index: number) => {
        onChange(values.map((v, i) => (i === index ? value : v)));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {values.map((value, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Text
                        style={{ width: '80%', fontSize: '1.1em' }}
                        placeholder={placeholder}
                        value={value}
                        onChange={(_, { value }) => handleChange(value, i)}
                    />
                    {i !== 0 && (
                        <Button
                            inline
                            appearance="secondary"
                            onClick={() => handleRemove(i)}
                            label=""
                            icon={<TrashCanCross />}
                            style={{ flexShrink: 0 }}
                        />
                    )}
                </div>
            ))}
            <Button appearance="secondary" onClick={handleAdd} style={{ width: '100%' }}>
                {buttonLabel}
            </Button>
        </div>
    );
}

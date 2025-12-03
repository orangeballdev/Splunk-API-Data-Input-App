import FormLabel from './FormLabel';

interface FormFieldProps {
    children: React.ReactNode;
    label: string;
    required?: boolean;
    tooltip?: string;
}

export default function FormField({ children, label, required, tooltip }: FormFieldProps) {
    return (
        <div style={{ marginBottom: '20px', width: '100%' }}>
            <FormLabel required={required} tooltip={tooltip}>
                {label}
            </FormLabel>
            {children}
        </div>
    );
}

import Typography from '@splunk/react-ui/Typography';

interface FormLabelProps {
    children: React.ReactNode;
    required?: boolean;
    tooltip?: string;
}

export default function FormLabel({ children, required, tooltip }: FormLabelProps) {
    return (
        <Typography 
            as="span" 
            variant="body" 
            weight="semiBold" 
            style={{ display: 'block', marginBottom: '8px' }}
            title={tooltip}
        >
            {children}
            {required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
    );
}

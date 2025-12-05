import Heading from '@splunk/react-ui/Heading';

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
    'data-tour'?: string;
}

export default function FormSection({ title, children, 'data-tour': dataTour }: FormSectionProps) {
    return (
        <div data-tour={dataTour}>
            <Heading 
                level={2} 
                style={{ 
                    marginTop: '40px', 
                    marginBottom: '24px', 
                    paddingBottom: '12px', 
                    borderBottom: '2px solid #ccc' 
                }}
            >
                {title}
            </Heading>
            {children}
        </div>
    );
}

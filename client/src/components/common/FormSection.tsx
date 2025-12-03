import Heading from '@splunk/react-ui/Heading';

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
}

export default function FormSection({ title, children }: FormSectionProps) {
    return (
        <>
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
        </>
    );
}

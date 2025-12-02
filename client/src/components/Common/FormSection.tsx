import React from 'react';
import Heading from '@splunk/react-ui/Heading';

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
    marginTop?: string;
}

/**
 * A reusable component for creating form sections with consistent styling
 */
const FormSection: React.FC<FormSectionProps> = ({ 
    title, 
    children,
    marginTop = '32px'
}) => {
    return (
        <>
            <Heading 
                level={2} 
                style={{ 
                    marginTop, 
                    marginBottom: '20px', 
                    paddingBottom: '10px', 
                    borderBottom: '2px solid #e0e0e0' 
                }}
            >
                {title}
            </Heading>
            {children}
        </>
    );
};

export default FormSection;

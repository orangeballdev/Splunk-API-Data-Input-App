import React, { useState } from 'react';
import Heading from '@splunk/react-ui/Heading';
import ChevronDown from '@splunk/react-icons/ChevronDown';
import ChevronUp from '@splunk/react-icons/ChevronUp';

interface RequestPreviewProps {
    url: string;
    headers: string[];
    method?: string;
}

/**
 * Parses a header string in "Header: Value" format
 */
function parseHeader(headerString: string): { name: string; value: string } | null {
    const colonIndex = headerString.indexOf(':');
    if (colonIndex === -1) return null;

    const name = headerString.slice(0, colonIndex).trim();
    const value = headerString.slice(colonIndex + 1).trim();

    if (!name) return null;
    return { name, value };
}

const RequestPreview: React.FC<RequestPreviewProps> = ({ url, headers, method = 'GET' }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const validHeaders = headers
        .filter(h => h.trim())
        .map(parseHeader)
        .filter((h): h is { name: string; value: string } => h !== null);

    const hasContent = url.trim() || validHeaders.length > 0;

    if (!hasContent) {
        return null;
    }

    return (
        <div style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            border: '1px solid #d6d6d6',
            marginTop: '16px',
            marginBottom: '16px',
            overflow: 'hidden'
        }}>
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isExpanded ? '#e8e8e8' : 'transparent',
                    transition: 'background-color 0.2s'
                }}
            >
                <Heading level={3} style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                    Request Preview
                </Heading>
                {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </div>

            {isExpanded && (
                <div style={{
                    padding: '16px',
                    backgroundColor: '#fff',
                    borderTop: '1px solid #d6d6d6',
                    fontFamily: 'Monaco, Menlo, "SF Mono", monospace',
                    fontSize: '13px'
                }}>
                    {/* Method and URL */}
                    <div style={{ marginBottom: validHeaders.length > 0 ? '16px' : 0 }}>
                        <div style={{ 
                            display: 'inline-block',
                            backgroundColor: '#00a65a',
                            color: '#fff',
                            padding: '2px 8px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            fontWeight: 600,
                            marginRight: '8px'
                        }}>
                            {method}
                        </div>
                        <span style={{ color: '#333', wordBreak: 'break-all' }}>
                            {url || <span style={{ color: '#999', fontStyle: 'italic' }}>No URL specified</span>}
                        </span>
                    </div>

                    {/* Headers */}
                    {validHeaders.length > 0 && (
                        <div style={{
                            borderTop: '1px solid #e8e8e8',
                            paddingTop: '12px'
                        }}>
                            <div style={{
                                color: '#666',
                                fontSize: '12px',
                                fontWeight: 600,
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Headers
                            </div>
                            {validHeaders.map((header, index) => (
                                <div key={index} style={{ 
                                    marginBottom: '6px',
                                    paddingLeft: '12px',
                                    display: 'flex',
                                    gap: '8px'
                                }}>
                                    <span style={{ color: '#0066cc', fontWeight: 500 }}>{header.name}:</span>
                                    <span style={{ color: '#333' }}>{header.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RequestPreview;

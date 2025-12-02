import React from 'react';

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
            backgroundColor: '#1a1a2e',
            borderRadius: '6px',
            padding: '16px',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            fontSize: '13px',
            marginTop: '12px',
            marginBottom: '12px',
            border: '1px solid #333'
        }}>
            <div style={{
                color: '#888',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '10px'
            }}>
                Request Preview
            </div>

            {/* Method and URL */}
            <div style={{ marginBottom: validHeaders.length > 0 ? '12px' : 0 }}>
                <span style={{ color: '#4ade80', fontWeight: 600 }}>{method}</span>
                <span style={{ color: '#e2e8f0', marginLeft: '8px', wordBreak: 'break-all' }}>
                    {url || <span style={{ color: '#666', fontStyle: 'italic' }}>No URL specified</span>}
                </span>
            </div>

            {/* Headers */}
            {validHeaders.length > 0 && (
                <div style={{
                    borderTop: '1px solid #333',
                    paddingTop: '10px'
                }}>
                    <div style={{
                        color: '#888',
                        fontSize: '11px',
                        marginBottom: '6px'
                    }}>
                        Headers:
                    </div>
                    {validHeaders.map((header, index) => (
                        <div key={index} style={{ marginBottom: '4px' }}>
                            <span style={{ color: '#60a5fa' }}>{header.name}</span>
                            <span style={{ color: '#888' }}>: </span>
                            <span style={{ color: '#fbbf24' }}>{header.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RequestPreview;

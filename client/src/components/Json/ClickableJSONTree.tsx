import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

interface ClickableJSONTreeProps {
    data: unknown;
    onPathClick?: (path: string) => void;
    onKeyRename?: (oldKey: string, newKey: string) => void;
    keyMappings?: Record<string, string>;
}

const TreeContainer = styled.div`
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', monospace;
    font-size: 13px;
    line-height: 1.5;
`;

const NodeRow = styled.div<{ $depth: number }>`
    padding-left: ${props => props.$depth * 16}px;
    display: flex;
    align-items: flex-start;
`;

const ExpandButton = styled.span`
    cursor: pointer;
    user-select: none;
    width: 16px;
    display: inline-block;
    color: #666;
    &:hover {
        color: #000;
    }
`;

const KeySpan = styled.span<{ $clickable: boolean; $isEditing?: boolean }>`
    color: #881391;
    cursor: ${props => props.$clickable ? 'pointer' : 'default'};
    border-radius: 3px;
    padding: 0 2px;

    ${props => props.$clickable && !props.$isEditing && `
        &:hover {
            background-color: #e8f4fc;
            text-decoration: underline;
        }
    `}
    
    ${props => props.$isEditing && `
        background-color: #fff3cd;
        border: 1px solid #ffc107;
    `}
`;

const KeyInput = styled.input`
    color: #881391;
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 3px;
    padding: 0 2px;
    font-family: inherit;
    font-size: inherit;
    outline: none;
    min-width: 50px;
`;

const ValueSpan = styled.span<{ $type: string }>`
    color: ${props => {
        switch (props.$type) {
            case 'string': return '#c41a16';
            case 'number': return '#1c00cf';
            case 'boolean': return '#0d22aa';
            case 'null': return '#808080';
            default: return '#000';
        }
    }};
`;

const BracketSpan = styled.span`
    color: #000;
`;

const ArrayIndexSpan = styled.span<{ $clickable: boolean }>`
    color: #666;
    cursor: ${props => props.$clickable ? 'pointer' : 'default'};
    border-radius: 3px;
    padding: 0 2px;

    ${props => props.$clickable && `
        &:hover {
            background-color: #e8f4fc;
            text-decoration: underline;
        }
    `}
`;

const Tooltip = styled.div`
    position: fixed;
    background: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    z-index: 1000;
    pointer-events: none;
`;

interface JSONNodeProps {
    keyName: string | number | null;
    value: unknown;
    path: string;
    depth: number;
    onPathClick?: (path: string) => void;
    onKeyRename?: (oldKey: string, newKey: string) => void;
    keyMappings?: Record<string, string>;
    isArrayItem?: boolean;
}

const JSONNode: React.FC<JSONNodeProps> = ({ keyName, value, path, depth, onPathClick, onKeyRename, keyMappings, isArrayItem }) => {
    const [expanded, setExpanded] = useState(true);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
    const [isEditingKey, setIsEditingKey] = useState(false);
    const [editedKeyName, setEditedKeyName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
    const isArray = Array.isArray(value);
    const hasChildren = isObject || isArray;

    // Get the display name (check if this key has been renamed)
    // Convert the current path to wildcard format and check if it matches any key mapping
    const wildcardPath = path.replace(/\[\d+\]/g, '[*]');
    const displayName = keyMappings?.[wildcardPath] || keyName;

    const handleKeyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // If Shift key is held, exclude the path
        if (e.shiftKey && onPathClick && path) {
            // Convert array indices to wildcards: $.products[0].name -> $.products[*].name
            const wildcardPath = path.replace(/\[\d+\]/g, '[*]');
            onPathClick(wildcardPath);
            return;
        }
        
        // Otherwise, rename the key (only for object keys, not array indices)
        if (onKeyRename && typeof keyName === 'string' && !isArrayItem) {
            setTooltip(null); // Clear tooltip when entering edit mode
            setIsEditingKey(true);
            setEditedKeyName(displayName as string);
        }
    };

    const handleKeyEditSubmit = () => {
        if (editedKeyName.trim() && editedKeyName !== displayName && onKeyRename && typeof keyName === 'string') {
            // Convert array indices to wildcards so it applies to all matching keys
            // e.g., $.items[0].title -> $.items[*].title
            const wildcardPath = path.replace(/\[\d+\]/g, '[*]');
            onKeyRename(wildcardPath, editedKeyName.trim());
        }
        setIsEditingKey(false);
    };

    const handleKeyEditCancel = () => {
        setIsEditingKey(false);
        setEditedKeyName('');
    };

    const handleKeyInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleKeyEditSubmit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleKeyEditCancel();
        }
    };

    useEffect(() => {
        if (isEditingKey && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingKey]);

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (path) {
            let tooltipText = '';
            if (onKeyRename && typeof keyName === 'string' && !isArrayItem) {
                tooltipText = `Click to rename`;
            }
            if (onPathClick) {
                tooltipText = tooltipText ? `${tooltipText} | Shift+Click to exclude` : `Shift+Click to exclude`;
            }
            if (tooltipText) {
                setTooltip({
                    x: e.clientX + 10,
                    y: e.clientY + 10,
                    text: tooltipText
                });
            }
        }
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (tooltip) {
            setTooltip({
                ...tooltip,
                x: e.clientX + 10,
                y: e.clientY + 10
            });
        }
    };

    const renderValue = () => {
        if (value === null) {
            return <ValueSpan $type="null">null</ValueSpan>;
        }
        if (typeof value === 'string') {
            return <ValueSpan $type="string">"{value}"</ValueSpan>;
        }
        if (typeof value === 'number') {
            return <ValueSpan $type="number">{value}</ValueSpan>;
        }
        if (typeof value === 'boolean') {
            return <ValueSpan $type="boolean">{value.toString()}</ValueSpan>;
        }
        return null;
    };

    const renderKey = () => {
        if (keyName === null) return null;

        if (isArrayItem) {
            return (
                <ArrayIndexSpan
                    $clickable={!!onPathClick}
                    onClick={handleKeyClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                >
                    [{keyName}]
                </ArrayIndexSpan>
            );
        }

        return (
            <>
                {isEditingKey ? (
                    <>
                        <span>"</span>
                        <KeyInput
                            ref={inputRef}
                            value={editedKeyName}
                            onChange={(e) => setEditedKeyName(e.target.value)}
                            onKeyDown={handleKeyInputKeyDown}
                            onBlur={handleKeyEditSubmit}
                        />
                        <span>"</span>
                    </>
                ) : (
                    <KeySpan
                        data-tour={depth === 1 ? 'json-key' : undefined}
                        $clickable={!!(onPathClick || onKeyRename)}
                        $isEditing={isEditingKey}
                        onClick={handleKeyClick}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onMouseMove={handleMouseMove}
                    >
                        "{displayName}"
                    </KeySpan>
                )}
                <span>: </span>
            </>
        );
    };

    if (!hasChildren) {
        return (
            <NodeRow $depth={depth}>
                <ExpandButton> </ExpandButton>
                {renderKey()}
                {renderValue()}
                {tooltip && (
                    <Tooltip style={{ left: tooltip.x, top: tooltip.y }}>
                        {tooltip.text}
                    </Tooltip>
                )}
            </NodeRow>
        );
    }

    const children = isArray ? (value as unknown[]) : Object.entries(value as Record<string, unknown>);
    const isEmpty = isArray ? (value as unknown[]).length === 0 : Object.keys(value as Record<string, unknown>).length === 0;

    return (
        <div>
            <NodeRow $depth={depth}>
                <ExpandButton onClick={() => setExpanded(!expanded)}>
                    {isEmpty ? ' ' : expanded ? '▼' : '▶'}
                </ExpandButton>
                {renderKey()}
                <BracketSpan>{isArray ? '[' : '{'}</BracketSpan>
                {!expanded && <BracketSpan>...</BracketSpan>}
                {(!expanded || isEmpty) && <BracketSpan>{isArray ? ']' : '}'}</BracketSpan>}
                {tooltip && (
                    <Tooltip style={{ left: tooltip.x, top: tooltip.y }}>
                        {tooltip.text}
                    </Tooltip>
                )}
            </NodeRow>
            {expanded && !isEmpty && (
                <>
                    {isArray
                        ? (children as unknown[]).map((item, index) => (
                            <JSONNode
                                key={index}
                                keyName={index}
                                value={item}
                                path={`${path}[${index}]`}
                                depth={depth + 1}
                                onPathClick={onPathClick}
                                onKeyRename={onKeyRename}
                                keyMappings={keyMappings}
                                isArrayItem
                            />
                        ))
                        : (children as [string, unknown][]).map(([key, val]) => (
                            <JSONNode
                                key={key}
                                keyName={key}
                                value={val}
                                path={path ? `${path}.${key}` : `$.${key}`}
                                depth={depth + 1}
                                onPathClick={onPathClick}
                                onKeyRename={onKeyRename}
                                keyMappings={keyMappings}
                            />
                        ))
                    }
                    <NodeRow $depth={depth}>
                        <ExpandButton> </ExpandButton>
                        <BracketSpan>{isArray ? ']' : '}'}</BracketSpan>
                    </NodeRow>
                </>
            )}
        </div>
    );
};

const ClickableJSONTree: React.FC<ClickableJSONTreeProps> = ({ data, onPathClick, onKeyRename, keyMappings }) => {
    if (data === null || data === undefined) {
        return null;
    }

    const isArray = Array.isArray(data);
    const isObject = typeof data === 'object' && !isArray;

    if (!isArray && !isObject) {
        // Primitive value at root
        return (
            <TreeContainer>
                <JSONNode 
                    keyName={null} 
                    value={data} 
                    path="$" 
                    depth={0} 
                    onPathClick={onPathClick}
                    onKeyRename={onKeyRename}
                    keyMappings={keyMappings}
                />
            </TreeContainer>
        );
    }

    return (
        <TreeContainer>
            <JSONNode 
                keyName={null} 
                value={data} 
                path="$" 
                depth={0} 
                onPathClick={onPathClick}
                onKeyRename={onKeyRename}
                keyMappings={keyMappings}
            />
        </TreeContainer>
    );
};

export default ClickableJSONTree;

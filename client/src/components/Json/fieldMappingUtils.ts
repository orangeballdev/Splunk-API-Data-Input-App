/**
 * Utility functions for field key renaming/mapping
 */

import type { FieldMapping } from '../ManageDataInputs/DataInputs.types';

/**
 * Recursively apply field mappings to rename keys in data
 * @param data - The data object to transform
 * @param mappings - Array of field mappings to apply
 * @returns Transformed data with renamed keys
 */
export function applyFieldMappings(
    data: unknown,
    mappings: FieldMapping[]
): unknown {
    if (!mappings || mappings.length === 0) {
        return data;
    }

    // Create a map for quick lookup
    const mappingMap = new Map<string, string>();
    for (const mapping of mappings) {
        if (mapping.originalKey && mapping.newKey) {
            mappingMap.set(mapping.originalKey, mapping.newKey);
        }
    }

    return applyMappingsRecursive(data, mappingMap);
}

function applyMappingsRecursive(
    data: unknown,
    mappingMap: Map<string, string>
): unknown {
    if (data === null || data === undefined) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => applyMappingsRecursive(item, mappingMap));
    }

    if (typeof data === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
            // Check if this key should be renamed
            const newKey = mappingMap.get(key) ?? key;
            // Recursively process the value
            result[newKey] = applyMappingsRecursive(value, mappingMap);
        }
        return result;
    }

    // Primitive values pass through unchanged
    return data;
}

/**
 * Detect all unique field keys in a JSON object (non-recursive, top-level only)
 * @param data - The data to scan for keys
 * @returns Array of unique field key names
 */
export function detectFieldKeys(data: unknown): string[] {
    const keys = new Set<string>();
    collectKeys(data, keys);
    return Array.from(keys).sort();
}

function collectKeys(data: unknown, keys: Set<string>): void {
    if (data === null || data === undefined) {
        return;
    }

    if (Array.isArray(data)) {
        for (const item of data) {
            collectKeys(item, keys);
        }
        return;
    }

    if (typeof data === 'object') {
        for (const key of Object.keys(data as Record<string, unknown>)) {
            keys.add(key);
            // Recursively collect keys from nested objects
            collectKeys((data as Record<string, unknown>)[key], keys);
        }
    }
}

/**
 * Validate a field mapping
 * @param mapping - The mapping to validate
 * @param existingMappings - Existing mappings to check for duplicates
 * @returns Error message if invalid, undefined if valid
 */
export function validateFieldMapping(
    mapping: FieldMapping,
    existingMappings: FieldMapping[]
): string | undefined {
    if (!mapping.originalKey) {
        return 'Original key is required';
    }
    if (!mapping.newKey) {
        return 'New key is required';
    }
    if (mapping.originalKey === mapping.newKey) {
        return 'New key must be different from original key';
    }

    // Check for duplicate original keys (excluding current mapping)
    const duplicateOriginal = existingMappings.some(
        m => m !== mapping && m.originalKey === mapping.originalKey
    );
    if (duplicateOriginal) {
        return `Original key "${mapping.originalKey}" is already mapped`;
    }

    // Check for duplicate new keys
    const duplicateNew = existingMappings.some(
        m => m !== mapping && m.newKey === mapping.newKey
    );
    if (duplicateNew) {
        return `New key "${mapping.newKey}" is already used in another mapping`;
    }

    return undefined;
}

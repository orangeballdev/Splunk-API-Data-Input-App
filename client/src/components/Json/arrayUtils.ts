/**
 * Utility functions for detecting and processing arrays in JSON data
 */

import jp from 'jsonpath';

export interface DetectedArray {
    path: string;
    length: number;
    totalCount: number; // Total number of items across all instances
    sampleItem: unknown;
}

/**
 * Recursively find all arrays in a JSON object and return their paths
 */
export function detectArraysInJson(
    data: unknown, 
    currentPath: string = '$',
    rootData?: unknown
): DetectedArray[] {
    const arrays: DetectedArray[] = [];
    const root = rootData !== undefined ? rootData : data;

    if (Array.isArray(data)) {
        // Calculate total count using jsonpath query to match generateSeparateEvents behavior
        let totalCount = data.length;
        
        if (currentPath.includes('[*]')) {
            try {
                const results = jp.query(root, currentPath);
                // Flatten the results to count actual items (same logic as generateSeparateEvents)
                const flattenArray = (arr: unknown[]): unknown[] => {
                    const flattened: unknown[] = [];
                    for (const item of arr) {
                        if (Array.isArray(item)) {
                            flattened.push(...flattenArray(item));
                        } else {
                            flattened.push(item);
                        }
                    }
                    return flattened;
                };
                totalCount = Array.isArray(results) ? flattenArray(results).length : data.length;
            } catch (error) {
                console.error(`Error calculating total count for ${currentPath}:`, error);
                totalCount = data.length;
            }
        }
        
        arrays.push({
            path: currentPath,
            length: data.length,
            totalCount: totalCount,
            sampleItem: data[0]
        });
        
        // Also check nested arrays in first item
        if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
            const nested = detectArraysInJson(data[0], `${currentPath}[*]`, root);
            arrays.push(...nested);
        }
    } else if (typeof data === 'object' && data !== null) {
        for (const [key, value] of Object.entries(data)) {
            const nested = detectArraysInJson(value, `${currentPath}.${key}`, root);
            arrays.push(...nested);
        }
    }

    return arrays;
}

/**
 * Get value at a JSONPath from an object
 * Supports simple paths like $.products or $.data.items
 */
export function getValueAtPath(data: unknown, path: string): unknown {
    if (path === '$') return data;

    const parts = path.replace(/^\$\.?/, '').split('.');
    let current: unknown = data;

    for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        if (typeof current !== 'object') return undefined;
        current = (current as Record<string, unknown>)[part];
    }

    return current;
}

/**
 * Generate separate events from data based on selected array paths
 * Supports nested arrays with wildcards like $.products[*].images
 */
export function generateSeparateEvents(
    data: unknown,
    separateArrayPaths: string[]
): unknown[] {
    if (!separateArrayPaths || separateArrayPaths.length === 0) {
        // No separation, return as single event
        return [data];
    }

    const events: unknown[] = [];

    for (const arrayPath of separateArrayPaths) {
        try {
            // Use jsonpath to query arrays, including nested ones with wildcards
            const results = jp.query(data, arrayPath);
            
            // Get the field name from the path (last part after dot or bracket)
            const pathMatch = arrayPath.match(/\.([^.[]+)(?:\[\*\])?$/);
            const fieldName = pathMatch ? pathMatch[1] : 'item';

            // Flatten all results recursively to get individual items
            const flattenArray = (arr: unknown[]): unknown[] => {
                const flattened: unknown[] = [];
                for (const item of arr) {
                    if (Array.isArray(item)) {
                        flattened.push(...flattenArray(item));
                    } else {
                        flattened.push(item);
                    }
                }
                return flattened;
            };

            const flatResults = Array.isArray(results) ? flattenArray(results) : [];
            
            for (const item of flatResults) {
                events.push({
                    _source_array: fieldName,
                    _array_path: arrayPath,
                    ...(typeof item === 'object' && item !== null ? item : { value: item })
                });
            }
        } catch (error) {
            console.error(`Error processing array path ${arrayPath}:`, error);
        }
    }

    // If no events were generated from arrays, return original data
    if (events.length === 0) {
        return [data];
    }

    return events;
}

/**
 * Format data as it would appear in Splunk (JSON event format)
 */
export function formatAsSplunkEvent(data: unknown, _index?: number): string {
    const event = {
        time: Math.floor(Date.now() / 1000),
        event: data
    };

    return JSON.stringify(event, null, 2);
}

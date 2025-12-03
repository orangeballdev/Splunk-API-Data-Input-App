import { type JSONElement } from '@splunk/react-ui/JSONTree';
import jp from 'jsonpath';

/**
 * Renames keys in a JSON object based on JSONPath mappings.
 * Only supports JSONPath expressions for specific locations.
 * @param obj The JSON object to clone and modify.
 * @param mappings Record of JSONPath to new key name.
 * @returns A new object with the specified keys renamed.
 */
export function renameKeysByJsonPath(obj: JSONElement, mappings: Record<string, string>): JSONElement {
    if (!Object.keys(mappings).length) return obj;
    const clone = structuredClone(obj);

    for (const [oldPath, newKeyName] of Object.entries(mappings)) {
        if (!newKeyName) continue;

        try {
            const matches = jp.paths(clone, oldPath);
            console.log(`Renaming path "${oldPath}" to "${newKeyName}", found ${matches.length} matches:`, matches);

            for (const match of matches) {
                if (match.length < 2) continue;

                const oldKey = match[match.length - 1];
                const parentPath = match.slice(0, -1);
                const parent = jp.value(clone, jp.stringify(parentPath));

                console.log(`  - Match: oldKey="${oldKey}", parentPath="${jp.stringify(parentPath)}", parent:`, parent);

                if (parent && typeof parent === 'object' && !Array.isArray(parent) && oldKey in parent) {
                    const value = parent[oldKey];
                    console.log(`    Renaming "${oldKey}" -> "${newKeyName}", value:`, value);
                    
                    // Preserve key order by rebuilding the object
                    const entries = Object.entries(parent);
                    const newEntries = entries.map(([k, v]) => 
                        k === oldKey ? [newKeyName, v] : [k, v]
                    );
                    
                    // Clear the parent object and rebuild it with new keys
                    for (const key of Object.keys(parent)) {
                        delete parent[key];
                    }
                    for (const [k, v] of newEntries) {
                        (parent as Record<string, unknown>)[k as string] = v;
                    }
                } else {
                    console.log(`    Skipping - parent invalid or key not found`);
                }
            }
        } catch (error) {
            console.warn(`Error renaming path "${oldPath}":`, error);
        }
    }

    return clone;
}

/**
 * Removes properties from a JSON object based on an array of JSONPath expressions.
 * @param obj The JSON object to clone and modify.
 * @param paths Array of JSONPath expressions to remove from the object.
 * @returns A new object with the specified paths removed.
 */
export function removeByJsonPaths(obj: JSONElement, paths: string[]): JSONElement {
    if (!paths.length) return obj;
    const clone = structuredClone(obj);

    for (const path of paths) {
        try {
            const matches = jp.paths(clone, path);

            for (const match of matches) {
                if (match.length < 2) continue;

                const keyToDelete = match[match.length - 1];
                const parentPath = match.slice(0, -1);
                const parent = jp.value(clone, jp.stringify(parentPath));

                if (parent && typeof parent === 'object') {
                    delete parent[keyToDelete];
                }
            }
        } catch {
            // Ignore invalid paths
        }
    }

    return clone;
}

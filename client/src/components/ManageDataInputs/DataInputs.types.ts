export type DataInputMode = 'overwrite';

/** Mapping to rename a field key before ingestion */
export interface FieldMapping {
    /** The original field name/path from the API response */
    originalKey: string;
    /** The new field name to use in Splunk */
    newKey: string;
}

export interface DataInputAppConfig {
    _key?: string;
    name: string;
    input_type: string;
    url: string;
    http_headers: string[];
    excluded_json_paths: string[];
    enabled: boolean;
    mode: DataInputMode;
    cron_expression: string;
    selected_output_location: string;
    /** Array paths to explode into separate events (e.g., ["$.products", "$.users"]) */
    separate_array_paths?: string[];
    /** Field key mappings to rename keys before ingestion */
    field_mappings?: FieldMapping[];
}
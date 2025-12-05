import type { JSONElement } from "@splunk/react-ui/JSONTree";
import { removeByJsonPaths, renameKeysByJsonPath } from '../components/Json/utils';

/**
 * Parse header string in "Header: Value" format
 */
export function parseHeaders(headerStrings: string[]): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const headerStr of headerStrings) {
    const colonIndex = headerStr.indexOf(':');
    if (colonIndex > 0) {
      const name = headerStr.slice(0, colonIndex).trim();
      const value = headerStr.slice(colonIndex + 1).trim();
      if (name) {
        headers[name] = value;
      }
    }
  }
  return headers;
}

/**
 * Get a human-readable error message for HTTP status codes
 */
export function getHttpErrorMessage(status: number, statusText: string): string {
  const messages: Record<number, string> = {
    400: 'Bad Request - The server could not understand the request',
    401: 'Unauthorized - Authentication is required',
    403: 'Forbidden - You do not have permission to access this resource',
    404: 'Not Found - The requested resource does not exist',
    405: 'Method Not Allowed - This HTTP method is not supported',
    408: 'Request Timeout - The server timed out waiting for the request',
    429: 'Too Many Requests - Rate limit exceeded',
    500: 'Internal Server Error - The server encountered an error',
    502: 'Bad Gateway - Invalid response from upstream server',
    503: 'Service Unavailable - The server is temporarily unavailable',
    504: 'Gateway Timeout - Upstream server did not respond in time',
  };
  return messages[status] || statusText || 'Unknown error';
}

/**
 * Fetches JSON data from a URL with optional headers and JSONPath filtering.
 * @param url The URL to fetch data from.
 * @param jsonPaths The JSONPaths to remove from the data.
 * @param httpHeaders Array of headers in "Header: Value" format
 * @param setRawData Callback to set the raw data.
 * @param onDataFetched Callback to handle the filtered data as a string.
 * @param setError Callback to set error messages.
 * @param setLoading Callback to set loading state.
 * @param keyMappings Optional key mappings to rename fields in the preview.
 */
export async function fetchDataPreview(
  url: string,
  jsonPaths: string[],
  httpHeaders: string[],
  setRawData: (data: JSONElement) => void,
  onDataFetched?: (data: string) => void,
  setError?: (msg: string | null) => void,
  setLoading?: (loading: boolean) => void,
  keyMappings?: Record<string, string>
) {
  if (setError) setError(null);
  if (setLoading) setLoading(true);
  if (onDataFetched) onDataFetched('');

  try {
    if (!url) throw new Error("Please enter a URL");

    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new Error(`Invalid URL format: "${url}"`);
    }

    const headers = parseHeaders(httpHeaders);

    // Fetch data directly from the API
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorMessage = getHttpErrorMessage(response.status, response.statusText);
      let errorDetails = `HTTP ${response.status}: ${errorMessage}`;

      // Include server response if available
      const responseText = await response.text();
      if (responseText && responseText.length < 500) {
        errorDetails += `\n\nServer response: ${responseText}`;
      }

      throw new Error(errorDetails);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      throw new Error(`Invalid response format: Only JSON is supported at the moment. The API returned ${contentType} but must return Content-Type: application/json`);
    }

    // Parse the JSON data from the response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error("Invalid JSON response: The API returned data that is not valid JSON. Only JSON format is supported at the moment.");
    }
    setRawData(data as JSONElement);
    let processed = jsonPaths.length ? removeByJsonPaths(data as JSONElement, jsonPaths) : data;
    if (keyMappings && Object.keys(keyMappings).length > 0) {
      processed = renameKeysByJsonPath(processed as JSONElement, keyMappings);
    }
    if (onDataFetched) onDataFetched(JSON.stringify(processed));
  } catch (err) {
    if (setError) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON response from server');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    }
  } finally {
    if (setLoading) setLoading(false);
  }
}

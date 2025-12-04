import type { JSONElement } from "@splunk/react-ui/JSONTree";
import { removeByJsonPaths } from "../Json/utils";

 /**
   * Fetches JSON data from a URL and applies JSONPath filtering.
   * @param url The URL to fetch data from.
   * @param jsonPaths The JSONPaths to remove from the data.
   * @param setRawData Callback to set the raw data.
   * @param onDataFetched Callback to handle the filtered data as a string.
   * @param setError Callback to set error messages.
   * @param setLoading Callback to set loading state.
   */
  export async function fetchDataPreview(
    url: string,
    jsonPaths: string[],
    setRawData: (data: JSONElement) => void,
    onDataFetched: (data: string) => void,
    setError: (msg: string | null) => void,
    setLoading: (loading: boolean) => void
  ) {
    setError(null);
    setLoading(true);
    onDataFetched('');

    try {
      if (!url) throw new Error("Please enter a URL");
      
      let response;
      try {
        response = await fetch(url);
      } catch (fetchError) {
        // Network error, CORS, or invalid URL
        throw new Error("Failed to fetch: Unable to connect to the API. This could be due to network issues, CORS restrictions, or an invalid URL.");
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const receivedType = contentType || "unknown";
        throw new Error(`Invalid response format: Only JSON is supported at the moment. The API returned ${receivedType} but must return Content-Type: application/json`);
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Invalid JSON response: The API returned data that is not valid JSON. Only JSON format is supported at the moment.");
      }
      
      setRawData(data as JSONElement); // Save the raw data for future filtering
      const filtered = jsonPaths.length ? removeByJsonPaths(data as JSONElement, jsonPaths) : data;
      onDataFetched(JSON.stringify(filtered));
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    } finally {
      setLoading(false);
    }
  }

    export const onJSONPathsChange = (jsonPaths: string[], rawData: JSONElement | null, setFilteredData: (data: JSONElement) => void, onFilteredDataChange: (data: string) => void) => {
      if (!rawData) return;
      const filtered = jsonPaths.length ? removeByJsonPaths(rawData, jsonPaths) : rawData;
      setFilteredData(filtered);
      onFilteredDataChange(JSON.stringify(filtered));
    };
  
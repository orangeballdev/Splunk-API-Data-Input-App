#!/usr/bin/env python3
"""
API Proxy endpoint for Splunk.
This bypasses CORS restrictions by making requests from the server side.
"""

import json
import sys
import os
import urllib.request
import urllib.error
import urllib.parse
import ssl

# Add Splunk's Python path
if 'SPLUNK_HOME' in os.environ:
    sys.path.insert(0, os.path.join(os.environ['SPLUNK_HOME'], 'lib', 'python3.9', 'site-packages'))

from splunk.persistconn.application import PersistentServerConnectionApplication


class ApiProxyHandler(PersistentServerConnectionApplication):
    """REST handler for proxying API requests to external services."""

    def __init__(self, command_line, command_arg):
        super().__init__()

    def handle(self, in_string):
        """Handle incoming requests."""
        try:
            # Parse the incoming request
            request = json.loads(in_string)

            # Get query parameters
            query_params = dict(request.get('query', []))

            url = query_params.get('url', '')
            headers_json = query_params.get('headers', '{}')
            method = query_params.get('method', 'GET')

            if not url:
                return self._error_response('URL parameter is required', 400)

            # URL decode if needed
            url = urllib.parse.unquote(url)

            # Parse headers
            try:
                headers = json.loads(headers_json) if headers_json else {}
            except json.JSONDecodeError:
                headers = {}

            # Make the request
            result = self._make_request(url, method, headers)

            # Return the result
            return {
                'status': 200,
                'payload': {
                    'status': 'success',
                    'status_code': result['status_code'],
                    'content_type': result.get('content_type', ''),
                    'data': result['data']
                }
            }

        except Exception as e:
            return self._error_response(str(e), 500)

    def _error_response(self, message, status=500):
        """Return an error response."""
        return {
            'status': status,
            'payload': {
                'status': 'error',
                'message': message
            }
        }

    def _make_request(self, url, method, headers):
        """Make an HTTP request to the specified URL."""
        # Create SSL context
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        # Build request
        req = urllib.request.Request(url, method=method.upper())

        # Add headers
        for name, value in headers.items():
            req.add_header(name, value)

        # Add a user agent if not specified
        if 'User-Agent' not in headers and 'user-agent' not in headers:
            req.add_header('User-Agent', 'Splunk-API-Proxy/1.0')

        try:
            with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
                data = response.read().decode('utf-8')
                return {
                    'status_code': response.status,
                    'content_type': response.headers.get('Content-Type', ''),
                    'data': data
                }
        except urllib.error.HTTPError as e:
            error_body = ''
            try:
                error_body = e.read().decode('utf-8')
            except:
                pass

            return {
                'status_code': e.code,
                'content_type': e.headers.get('Content-Type', '') if e.headers else '',
                'data': error_body or str(e.reason)
            }
        except urllib.error.URLError as e:
            raise Exception(f'Network error: {str(e.reason)}')
        except Exception as e:
            raise Exception(f'Request failed: {str(e)}')

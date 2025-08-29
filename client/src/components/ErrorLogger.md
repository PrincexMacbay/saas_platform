# Error Logger Component

A comprehensive error logging system that captures both frontend and backend errors and displays them in a collapsible panel at the bottom left of the web app.

## Features

- **Automatic Error Capture**: Captures JavaScript errors, unhandled promise rejections, console errors/warnings, and network errors
- **Manual Error Logging**: Allows manual logging of errors from anywhere in the app
- **Error Filtering**: Filter errors by type (frontend, backend, network, api, validation)
- **Error Export**: Export errors as JSON for debugging
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Automatically adapts to system dark mode preference

## Usage

### Automatic Error Capture

The ErrorLogger automatically captures:
- JavaScript runtime errors
- Unhandled promise rejections
- Console errors and warnings
- Network errors (HTTP 4xx/5xx responses)
- XMLHttpRequest errors

### Manual Error Logging

You can manually log errors from anywhere in your app:

```javascript
import { logError, logFrontendError, logBackendError, logNetworkError, logApiError, logValidationError } from '../utils/errorLogger';

// Log a general error
logError(new Error('Something went wrong'), 'frontend', { component: 'MyComponent' });

// Log specific types of errors
logFrontendError(new Error('UI Error'), { component: 'Button' });
logBackendError(new Error('Server Error'), { endpoint: '/api/users' });
logNetworkError(new Error('Network Error'), { url: 'https://api.example.com' });
logApiError(new Error('API Error'), { method: 'POST', data: { id: 1 } });
logValidationError(new Error('Invalid input'), { field: 'email' });
```

### Wrapping Functions with Error Logging

```javascript
import { withErrorLogging } from '../utils/errorLogger';

const fetchData = withErrorLogging(async (id) => {
  const response = await fetch(`/api/data/${id}`);
  return response.json();
}, 'api');

// Now any errors in fetchData will be automatically logged
```

### Logging API Response Errors

```javascript
import { logApiResponseError } from '../utils/errorLogger';

try {
  const response = await fetch('/api/users');
  if (!response.ok) {
    logApiResponseError(response, { userId: 123 });
  }
} catch (error) {
  // Error will be automatically logged by the interceptor
}
```

### Logging Validation Errors

```javascript
import { logValidationErrors } from '../utils/errorLogger';

const validationErrors = [
  { field: 'email', message: 'Invalid email format' },
  { field: 'password', message: 'Password too short' }
];

logValidationErrors(validationErrors, { email: 'test@', password: '123' });
```

## Error Types

- **frontend**: JavaScript errors, UI errors, console errors
- **backend**: Server-side errors
- **network**: Network connectivity issues, HTTP errors
- **api**: API-specific errors
- **validation**: Form validation errors

## UI Controls

- **Minimize/Maximize**: Click the minimize button to hide/show the error logger
- **Expand/Collapse**: Click the expand button to show more/less error details
- **Auto-scroll**: Toggle auto-scroll to automatically scroll to new errors
- **Filter**: Use the filter buttons to show only specific types of errors
- **Clear All**: Remove all logged errors
- **Export**: Download errors as JSON file

## Error Information

Each logged error includes:
- **Timestamp**: When the error occurred
- **Type**: Error category (frontend, backend, network, etc.)
- **Message**: Error message
- **Stack Trace**: JavaScript stack trace (if available)
- **Context**: Additional context information
- **URL**: Page URL where error occurred
- **User Agent**: Browser information

## Integration

The ErrorLogger is automatically integrated into the app via the `ErrorLoggerProvider` in `App.jsx`. It's positioned at the bottom left of the screen and doesn't interfere with the main application UI.

## Development

To test the error logger:

1. Open the browser console
2. Trigger some errors:
   ```javascript
   // Test console error
   console.error('Test error');
   
   // Test unhandled promise rejection
   Promise.reject(new Error('Test promise rejection'));
   
   // Test runtime error
   throw new Error('Test runtime error');
   ```
3. Check the error logger panel for captured errors

## Customization

You can customize the error logger by modifying:
- `ErrorLogger.css`: Styling and appearance
- `ErrorLogger.jsx`: Component behavior and UI
- `ErrorLoggerContext.jsx`: Context provider logic
- `errorLogger.js`: Utility functions

## Best Practices

1. **Use appropriate error types**: Choose the right error type for better categorization
2. **Provide context**: Include relevant context information when logging errors
3. **Don't log sensitive data**: Avoid logging passwords, tokens, or other sensitive information
4. **Use meaningful error messages**: Write clear, descriptive error messages
5. **Export errors for debugging**: Use the export feature to share error logs with developers

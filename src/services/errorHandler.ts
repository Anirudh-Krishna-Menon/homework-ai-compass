
export class URLExtractionError extends Error {
  constructor(
    message: string,
    public code: 'NETWORK_ERROR' | 'PARSE_ERROR' | 'CORS_ERROR' | 'INVALID_URL' | 'NO_CONTENT',
    public url?: string
  ) {
    super(message);
    this.name = 'URLExtractionError';
  }
}

export class ErrorHandler {
  static handleUrlError(error: any, url: string): URLExtractionError {
    console.error('URL extraction error:', error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return new URLExtractionError(
        'Unable to access the URL due to CORS restrictions. This is common with classroom platforms that require login.',
        'CORS_ERROR',
        url
      );
    }
    
    if (error.message?.includes('Invalid URL')) {
      return new URLExtractionError(
        'The provided URL is not valid. Please check the format and try again.',
        'INVALID_URL',
        url
      );
    }
    
    if (error.message?.includes('HTTP error')) {
      return new URLExtractionError(
        'The webpage returned an error. It might be private or require authentication.',
        'NETWORK_ERROR',
        url
      );
    }
    
    return new URLExtractionError(
      'An unexpected error occurred while extracting content from the URL.',
      'NETWORK_ERROR',
      url
    );
  }
  
  static getErrorSuggestion(error: URLExtractionError): string {
    switch (error.code) {
      case 'CORS_ERROR':
        return 'Try copying the text content directly from the page instead of using the URL.';
      case 'INVALID_URL':
        return 'Make sure the URL starts with http:// or https:// and is properly formatted.';
      case 'NETWORK_ERROR':
        return 'Check your internet connection and verify the URL is accessible.';
      case 'NO_CONTENT':
        return 'The page might be empty or require login. Try copying the content manually.';
      case 'PARSE_ERROR':
        return 'The page content could not be analyzed. Try using the text extraction method instead.';
      default:
        return 'Please try again or use the text extraction method as an alternative.';
    }
  }
}

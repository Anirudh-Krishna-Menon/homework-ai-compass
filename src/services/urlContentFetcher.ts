
export interface ExtractedContent {
  title: string;
  content: string;
  url: string;
  timestamp: Date;
}

export class URLContentFetcher {
  private corsProxyUrl = 'https://api.allorigins.win/get?url=';
  
  async fetchContent(url: string): Promise<ExtractedContent> {
    try {
      // Validate URL format
      const urlObj = new URL(url);
      console.log(`Fetching content from: ${url}`);
      
      // Use CORS proxy to fetch content
      const proxyUrl = `${this.corsProxyUrl}${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const htmlContent = data.contents;
      
      // Parse HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Extract title
      const title = doc.querySelector('title')?.textContent || 
                   doc.querySelector('h1')?.textContent || 
                   'Extracted Content';
      
      // Extract main content using various selectors
      const contentSelectors = [
        'main',
        '[role="main"]',
        '.content',
        '.main-content',
        '.assignment',
        '.announcement',
        '.post-content',
        'article',
        '.description'
      ];
      
      let extractedText = '';
      
      // Try each selector until we find content
      for (const selector of contentSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          extractedText = element.textContent || '';
          break;
        }
      }
      
      // Fallback: extract all paragraph text
      if (!extractedText) {
        const paragraphs = doc.querySelectorAll('p');
        extractedText = Array.from(paragraphs)
          .map(p => p.textContent)
          .filter(text => text && text.trim().length > 20)
          .join('\n\n');
      }
      
      // Final fallback: use body text
      if (!extractedText) {
        extractedText = doc.body?.textContent || '';
      }
      
      // Clean up the text
      extractedText = this.cleanText(extractedText);
      
      console.log(`Successfully extracted ${extractedText.length} characters from ${url}`);
      
      return {
        title: title.trim(),
        content: extractedText,
        url,
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('Error fetching URL content:', error);
      throw new Error(`Failed to fetch content from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
      .trim();
  }
  
  // Check if URL is likely a classroom platform
  isClassroomURL(url: string): boolean {
    const classroomDomains = [
      'classroom.google.com',
      'canvas.instructure.com',
      'blackboard.com',
      'moodle',
      'schoology.com',
      'edmodo.com',
      'brightspace.com'
    ];
    
    return classroomDomains.some(domain => url.includes(domain));
  }
}

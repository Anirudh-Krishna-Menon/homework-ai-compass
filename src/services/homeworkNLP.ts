
export interface ExtractedAssignment {
  title: string;
  description: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  deadline: Date;
  type: 'assignment' | 'reading' | 'project' | 'quiz' | 'exam' | 'other';
  confidence: number;
}

export class HomeworkNLP {
  private subjectKeywords = {
    math: ['math', 'algebra', 'calculus', 'geometry', 'statistics', 'arithmetic', 'equation', 'formula', 'solve', 'calculate'],
    science: ['science', 'biology', 'chemistry', 'physics', 'lab', 'experiment', 'hypothesis', 'molecule', 'atom', 'cell'],
    english: ['english', 'literature', 'writing', 'essay', 'poem', 'novel', 'grammar', 'vocabulary', 'reading', 'paragraph'],
    history: ['history', 'social studies', 'geography', 'government', 'civilization', 'war', 'treaty', 'constitution', 'revolution'],
    art: ['art', 'drawing', 'painting', 'sculpture', 'design', 'creative', 'visual', 'artistic', 'sketch'],
    music: ['music', 'instrument', 'song', 'melody', 'rhythm', 'note', 'chord', 'composition'],
    pe: ['physical education', 'pe', 'sports', 'exercise', 'fitness', 'athletic', 'gym', 'workout']
  };

  private assignmentKeywords = [
    'assignment', 'homework', 'task', 'project', 'essay', 'report', 'study', 'complete', 'finish',
    'submit', 'turn in', 'due', 'deadline', 'read', 'write', 'solve', 'practice', 'review',
    'prepare', 'research', 'analyze', 'create', 'design', 'build', 'present', 'quiz', 'test', 'exam'
  ];

  private priorityKeywords = {
    high: ['urgent', 'important', 'asap', 'priority', 'critical', 'final', 'exam', 'test', 'major'],
    low: ['optional', 'extra credit', 'bonus', 'if time permits', 'recommended', 'suggested']
  };

  private datePatterns = [
    // Match formats like "due Monday", "by Friday", "before next week"
    /(?:due|by|before|until)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today|next\s+week|this\s+week)/gi,
    // Match date formats like "12/15", "Dec 15", "December 15th"
    /(?:due|by|before|until)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\w+\s+\d{1,2}(?:st|nd|rd|th)?)/gi,
    // Match "in 3 days", "in a week"
    /(?:due|by|before|until)\s+(?:in\s+)?(\d+\s+(?:days?|weeks?|months?))/gi
  ];

  extractAssignments(text: string): ExtractedAssignment[] {
    console.log('Starting NLP extraction on text of length:', text.length);
    
    const assignments: ExtractedAssignment[] = [];
    const sentences = this.splitIntoSentences(text);
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const nextSentence = sentences[i + 1] || '';
      const combinedText = `${sentence} ${nextSentence}`.toLowerCase();
      
      // Check if this sentence contains assignment keywords
      const hasAssignmentKeyword = this.assignmentKeywords.some(keyword => 
        combinedText.includes(keyword.toLowerCase())
      );
      
      if (hasAssignmentKeyword) {
        const assignment = this.extractAssignmentFromText(sentence, nextSentence, combinedText);
        if (assignment && assignment.confidence > 0.3) {
          assignments.push(assignment);
        }
      }
    }
    
    console.log(`Extracted ${assignments.length} potential assignments`);
    return this.deduplicateAssignments(assignments);
  }

  private extractAssignmentFromText(sentence: string, nextSentence: string, combinedText: string): ExtractedAssignment | null {
    try {
      // Extract title - look for the main action or assignment name
      const title = this.extractTitle(sentence);
      if (!title || title.length < 5) return null;
      
      // Extract subject
      const subject = this.extractSubject(combinedText);
      
      // Extract deadline
      const deadline = this.extractDeadline(combinedText);
      
      // Extract priority
      const priority = this.extractPriority(combinedText);
      
      // Extract assignment type
      const type = this.extractType(combinedText);
      
      // Calculate confidence score
      const confidence = this.calculateConfidence(combinedText, title);
      
      return {
        title: title.trim(),
        description: `${sentence} ${nextSentence}`.trim(),
        subject,
        priority,
        deadline,
        type,
        confidence
      };
    } catch (error) {
      console.error('Error extracting assignment:', error);
      return null;
    }
  }

  private extractTitle(sentence: string): string {
    // Remove common prefixes and clean up
    let title = sentence
      .replace(/^(homework|assignment|task|please|students?|you need to|your|the)\s+/gi, '')
      .replace(/\s+(is|are|will be|due|by|before).*$/gi, '')
      .replace(/[.!?]+$/, '')
      .trim();
    
    // Take first reasonable part if too long
    if (title.length > 100) {
      const parts = title.split(/[,;]/);
      title = parts[0] || title.substring(0, 100);
    }
    
    return title;
  }

  private extractSubject(text: string): string {
    for (const [subject, keywords] of Object.entries(this.subjectKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return subject;
      }
    }
    return 'other';
  }

  private extractDeadline(text: string): Date {
    // Default to one week from now
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 7);
    
    for (const pattern of this.datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const dateStr = match[1] || match[0];
        const parsedDate = this.parseDate(dateStr);
        if (parsedDate && parsedDate > new Date()) {
          return parsedDate;
        }
      }
    }
    
    return defaultDeadline;
  }

  private parseDate(dateStr: string): Date | null {
    const now = new Date();
    const lowerDateStr = dateStr.toLowerCase();
    
    // Handle relative dates
    if (lowerDateStr.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      return tomorrow;
    }
    
    if (lowerDateStr.includes('today')) {
      return now;
    }
    
    if (lowerDateStr.includes('next week')) {
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      return nextWeek;
    }
    
    // Handle day names
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
      if (lowerDateStr.includes(days[i])) {
        const targetDay = i;
        const currentDay = now.getDay();
        const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + daysUntilTarget);
        return targetDate;
      }
    }
    
    // Try parsing as a regular date
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime()) && parsed > now) {
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to parse date:', dateStr);
    }
    
    return null;
  }

  private extractPriority(text: string): 'low' | 'medium' | 'high' {
    if (this.priorityKeywords.high.some(keyword => text.includes(keyword))) {
      return 'high';
    }
    if (this.priorityKeywords.low.some(keyword => text.includes(keyword))) {
      return 'low';
    }
    return 'medium';
  }

  private extractType(text: string): 'assignment' | 'reading' | 'project' | 'quiz' | 'exam' | 'other' {
    if (text.includes('read') || text.includes('chapter')) return 'reading';
    if (text.includes('project') || text.includes('build') || text.includes('create')) return 'project';
    if (text.includes('quiz')) return 'quiz';
    if (text.includes('exam') || text.includes('test')) return 'exam';
    if (text.includes('assignment') || text.includes('homework')) return 'assignment';
    return 'other';
  }

  private calculateConfidence(text: string, title: string): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence for assignment keywords
    const assignmentKeywordCount = this.assignmentKeywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    ).length;
    confidence += assignmentKeywordCount * 0.1;
    
    // Boost for date mentions
    if (this.datePatterns.some(pattern => pattern.test(text))) {
      confidence += 0.2;
    }
    
    // Boost for subject keywords
    const hasSubjectKeyword = Object.values(this.subjectKeywords)
      .flat()
      .some(keyword => text.includes(keyword));
    if (hasSubjectKeyword) {
      confidence += 0.15;
    }
    
    // Reduce confidence for very short titles
    if (title.length < 10) {
      confidence -= 0.2;
    }
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }

  private deduplicateAssignments(assignments: ExtractedAssignment[]): ExtractedAssignment[] {
    const unique: ExtractedAssignment[] = [];
    
    for (const assignment of assignments) {
      const isDuplicate = unique.some(existing => 
        this.similarity(existing.title.toLowerCase(), assignment.title.toLowerCase()) > 0.7
      );
      
      if (!isDuplicate) {
        unique.push(assignment);
      }
    }
    
    return unique.sort((a, b) => b.confidence - a.confidence);
  }

  private similarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

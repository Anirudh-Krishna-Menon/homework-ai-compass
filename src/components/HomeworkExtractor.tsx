import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Brain, Link, FileText, Wand2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { URLContentFetcher } from '@/services/urlContentFetcher';
import { HomeworkNLP } from '@/services/homeworkNLP';

interface Task {
  title: string;
  description: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  completed: boolean;
  source: 'ai' | 'manual';
}

interface HomeworkExtractorProps {
  onTasksExtracted: (task: Task) => void;
}

const HomeworkExtractor: React.FC<HomeworkExtractorProps> = ({ onTasksExtracted }) => {
  const [inputText, setInputText] = useState('');
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUrlProcessing, setIsUrlProcessing] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [urlContent, setUrlContent] = useState<string>('');
  const { toast } = useToast();

  const urlFetcher = new URLContentFetcher();
  const nlpProcessor = new HomeworkNLP();

  // AI-powered text processing simulation
  const processTextWithAI = async (text: string): Promise<Task[]> => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simple NLP-like pattern matching for homework extraction
    const homeworkPatterns = [
      /(?:homework|assignment|task|due|submit)[\s:]*(.+?)(?:\.|$|due|by)/gi,
      /(?:read|write|solve|complete|study)[\s:]*(.+?)(?:\.|$|due|by)/gi,
      /(?:chapter|page|exercise|problem)[\s:]*(.+?)(?:\.|$|due|by)/gi,
    ];

    const datePatterns = [
      /(?:due|by|before)\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?)/gi,
      /(?:due|by|before)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/gi,
      /(?:tomorrow|next\s+\w+|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi
    ];

    const subjectPatterns = [
      { pattern: /math|algebra|calculus|geometry|statistics/gi, subject: 'math' },
      { pattern: /science|biology|chemistry|physics/gi, subject: 'science' },
      { pattern: /english|literature|writing|reading/gi, subject: 'english' },
      { pattern: /history|social studies|geography/gi, subject: 'history' }
    ];

    const tasks: Task[] = [];
    let matches = [];

    // Extract potential homework items
    for (const pattern of homeworkPatterns) {
      const patternMatches = [...text.matchAll(pattern)];
      matches.push(...patternMatches);
    }

    matches.forEach((match, index) => {
      if (match[1] && match[1].trim().length > 5) {
        let subject = 'other';
        
        // Determine subject
        for (const subjectPattern of subjectPatterns) {
          if (subjectPattern.pattern.test(match[0])) {
            subject = subjectPattern.subject;
            break;
          }
        }

        // Extract deadline
        let deadline = new Date();
        deadline.setDate(deadline.getDate() + 7); // Default to 1 week
        
        const dateMatch = text.match(datePatterns[0]) || text.match(datePatterns[1]);
        if (dateMatch) {
          // Simple date parsing
          if (text.toLowerCase().includes('tomorrow')) {
            deadline.setDate(deadline.getDate() + 1);
          } else if (text.toLowerCase().includes('next week')) {
            deadline.setDate(deadline.getDate() + 7);
          }
        }

        // Determine priority based on keywords
        let priority: 'low' | 'medium' | 'high' = 'medium';
        if (text.toLowerCase().includes('urgent') || text.toLowerCase().includes('important')) {
          priority = 'high';
        } else if (text.toLowerCase().includes('optional') || text.toLowerCase().includes('extra credit')) {
          priority = 'low';
        }

        tasks.push({
          title: match[1].trim(),
          description: match[0].trim(),
          subject,
          priority,
          deadline: deadline.toISOString().split('T')[0],
          completed: false,
          source: 'ai'
        });
      }
    });

    setIsProcessing(false);
    return tasks;
  };

  const processWithAdvancedNLP = async (text: string): Promise<Task[]> => {
    console.log('Processing text with advanced NLP...');
    
    try {
      const assignments = nlpProcessor.extractAssignments(text);
      
      const tasks: Task[] = assignments.map(assignment => ({
        title: assignment.title,
        description: assignment.description,
        subject: assignment.subject,
        priority: assignment.priority,
        deadline: assignment.deadline.toISOString().split('T')[0],
        completed: false,
        source: 'ai' as const
      }));
      
      console.log(`Advanced NLP extracted ${tasks.length} tasks`);
      return tasks;
    } catch (error) {
      console.error('Advanced NLP processing failed:', error);
      // Fallback to simple processing
      return await processTextWithAI(text);
    }
  };

  const handleTextExtraction = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to analyze.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      const tasks = await processWithAdvancedNLP(inputText);
      setExtractedTasks(tasks);
      
      if (tasks.length > 0) {
        toast({
          title: "Tasks Extracted",
          description: `Found ${tasks.length} potential homework task(s) using advanced AI analysis.`,
        });
      } else {
        toast({
          title: "No Tasks Found",
          description: "AI couldn't identify any homework tasks in the provided text. Try adding more specific keywords.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Processing Error",
        description: "There was an error processing the text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlExtraction = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to analyze.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUrlProcessing(true);
      setUrlContent('');
      
      toast({
        title: "Fetching Content",
        description: "Extracting content from the provided URL...",
      });

      // Fetch content from URL
      const content = await urlFetcher.fetchContent(url);
      setUrlContent(content.content);
      
      toast({
        title: "Content Extracted",
        description: `Successfully extracted ${content.content.length} characters. Now analyzing for homework...`,
      });

      // Process the extracted content with NLP
      const tasks = await processWithAdvancedNLP(content.content);
      setExtractedTasks(tasks);
      
      if (tasks.length > 0) {
        toast({
          title: "Success!",
          description: `Found ${tasks.length} homework task(s) from ${content.title}`,
        });
      } else {
        toast({
          title: "No Assignments Found",
          description: "Couldn't identify any homework tasks from this URL. The content might not contain assignment information.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('URL extraction error:', error);
      toast({
        title: "URL Extraction Failed",
        description: error instanceof Error ? error.message : "Failed to extract content from URL. Please check the URL and try again.",
        variant: "destructive"
      });
    } finally {
      setIsUrlProcessing(false);
    }
  };

  const confirmTask = (task: Task) => {
    onTasksExtracted(task);
    setExtractedTasks(prev => prev.filter(t => t !== task));
    toast({
      title: "Task Added",
      description: `"${task.title}" has been added to your homework list.`,
    });
  };

  const rejectTask = (task: Task) => {
    setExtractedTasks(prev => prev.filter(t => t !== task));
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Advanced AI Homework Extraction</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Input Method */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <h3 className="font-medium">Extract from Text</h3>
            </div>
            <Textarea
              placeholder="Paste your classroom message, email, or assignment text here. The advanced AI will analyze it using NLP to extract homework tasks..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={6}
              className="min-h-[120px]"
            />
            <Button 
              onClick={handleTextExtraction} 
              disabled={isProcessing || !inputText.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing with Advanced AI...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Extract Homework with Advanced NLP
                </>
              )}
            </Button>
          </div>

          {/* URL Input Method */}
          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center space-x-2">
              <Link className="w-4 h-4" />
              <h3 className="font-medium">Extract from URL</h3>
              <span className="text-sm text-green-600 font-medium">✓ Now Available!</span>
            </div>
            <Input
              placeholder="Enter Google Classroom, Canvas, or any educational platform URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button 
              onClick={handleUrlExtraction} 
              disabled={isUrlProcessing || !url.trim()}
              className="w-full"
            >
              {isUrlProcessing ? (
                <>
                  <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting from URL...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  Extract Homework from URL
                </>
              )}
            </Button>
            
            {urlContent && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Extracted Content Preview:</h4>
                <p className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                  {urlContent.substring(0, 300)}...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Extracted Tasks Review */}
      {extractedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Review AI-Extracted Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {extractedTasks.map((task, index) => (
                <div key={index} className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => confirmTask(task)}>
                        Add Task
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => rejectTask(task)}>
                        Reject
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {task.subject}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center space-x-1">
                      {getPriorityIcon(task.priority)}
                      <span>{task.priority} priority</span>
                    </span>
                    <span className="text-gray-500">
                      Due: {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HomeworkExtractor;

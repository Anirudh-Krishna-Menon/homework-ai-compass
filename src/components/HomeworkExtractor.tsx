
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Brain, Link, FileText, Wand2 } from 'lucide-react';

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
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const { toast } = useToast();

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
      const tasks = await processTextWithAI(inputText);
      setExtractedTasks(tasks);
      
      if (tasks.length > 0) {
        toast({
          title: "Tasks Extracted",
          description: `Found ${tasks.length} potential homework task(s) using AI analysis.`,
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

    toast({
      title: "Feature Coming Soon",
      description: "URL extraction will be available in the next update. For now, please copy and paste the text content.",
    });
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>AI Homework Extraction</span>
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
              placeholder="Paste your classroom message, email, or assignment text here. The AI will analyze it to extract homework tasks..."
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
                  Processing with AI...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Extract Homework with AI
                </>
              )}
            </Button>
          </div>

          {/* URL Input Method */}
          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center space-x-2">
              <Link className="w-4 h-4" />
              <h3 className="font-medium">Extract from URL</h3>
            </div>
            <Input
              placeholder="Enter Google Classroom or other platform URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button 
              onClick={handleUrlExtraction} 
              variant="outline"
              disabled={!url.trim()}
              className="w-full"
            >
              <Link className="w-4 h-4 mr-2" />
              Extract from URL (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Tasks Review */}
      {extractedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Extracted Tasks</CardTitle>
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
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {task.priority} priority
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

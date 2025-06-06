
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Brain, ExternalLink, RefreshCw, CheckCircle, Circle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  completed: boolean;
  source: 'ai' | 'manual';
}

interface Question {
  id: string;
  question: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
  url?: string;
  relatedTask?: string;
}

interface QuestionRetrieverProps {
  tasks: Task[];
}

const QuestionRetriever: React.FC<QuestionRetrieverProps> = ({ tasks }) => {
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const { toast } = useToast();

  // Simulated educational question database
  const questionDatabase = {
    math: [
      {
        question: "Solve for x: 2x + 5 = 15",
        difficulty: 'easy' as const,
        source: "Khan Academy",
        url: "https://khanacademy.org"
      },
      {
        question: "Find the derivative of f(x) = x³ + 2x² - 5x + 1",
        difficulty: 'hard' as const,
        source: "MIT OpenCourseWare",
        url: "https://ocw.mit.edu"
      },
      {
        question: "What is the area of a circle with radius 7cm?",
        difficulty: 'medium' as const,
        source: "Wolfram Alpha",
        url: "https://wolframalpha.com"
      }
    ],
    science: [
      {
        question: "What is the chemical formula for water?",
        difficulty: 'easy' as const,
        source: "Khan Academy",
        url: "https://khanacademy.org"
      },
      {
        question: "Explain the process of photosynthesis in plants",
        difficulty: 'medium' as const,
        source: "National Geographic Education",
        url: "https://education.nationalgeographic.org"
      },
      {
        question: "Calculate the kinetic energy of a 5kg object moving at 10m/s",
        difficulty: 'hard' as const,
        source: "Physics Classroom",
        url: "https://physicsclassroom.com"
      }
    ],
    english: [
      {
        question: "Identify the main theme in 'To Kill a Mockingbird'",
        difficulty: 'medium' as const,
        source: "SparkNotes",
        url: "https://sparknotes.com"
      },
      {
        question: "What is the difference between a metaphor and a simile?",
        difficulty: 'easy' as const,
        source: "Grammarly",
        url: "https://grammarly.com"
      },
      {
        question: "Analyze the use of symbolism in Shakespeare's Hamlet",
        difficulty: 'hard' as const,
        source: "Literature Online",
        url: "https://literature.org"
      }
    ],
    history: [
      {
        question: "When did World War II end?",
        difficulty: 'easy' as const,
        source: "History.com",
        url: "https://history.com"
      },
      {
        question: "Explain the causes of the American Civil War",
        difficulty: 'medium' as const,
        source: "Smithsonian Magazine",
        url: "https://smithsonianmag.com"
      },
      {
        question: "Analyze the impact of the Industrial Revolution on society",
        difficulty: 'hard' as const,
        source: "Stanford History Education Group",
        url: "https://sheg.stanford.edu"
      }
    ]
  };

  const searchQuestions = async (subject?: string, taskId?: string) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      let searchSubject = subject || selectedSubject;
      
      if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          searchSubject = task.subject;
        }
      }
      
      let questionsToShow: Question[] = [];
      
      if (searchSubject === 'all') {
        // Get questions from all subjects
        Object.entries(questionDatabase).forEach(([subj, qs]) => {
          const mappedQuestions = qs.map((q, index) => ({
            id: `${subj}-${index}`,
            question: q.question,
            subject: subj,
            difficulty: q.difficulty,
            source: q.source,
            url: q.url,
            relatedTask: taskId
          }));
          questionsToShow.push(...mappedQuestions.slice(0, 2)); // Limit per subject
        });
      } else {
        // Get questions for specific subject
        const subjectQuestions = questionDatabase[searchSubject as keyof typeof questionDatabase] || [];
        questionsToShow = subjectQuestions.map((q, index) => ({
          id: `${searchSubject}-${index}`,
          question: q.question,
          subject: searchSubject,
          difficulty: q.difficulty,
          source: q.source,
          url: q.url,
          relatedTask: taskId
        }));
      }
      
      setQuestions(questionsToShow);
      setIsLoading(false);
      
      toast({
        title: "Questions Retrieved",
        description: `Found ${questionsToShow.length} educational questions for ${searchSubject === 'all' ? 'all subjects' : searchSubject}.`,
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Search Error",
        description: "Failed to retrieve questions. Please try again.",
        variant: "destructive"
      });
    }
  };

  const searchForTask = (taskId: string) => {
    setSelectedTask(taskId);
    searchQuestions(undefined, taskId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      math: 'bg-blue-100 text-blue-800',
      science: 'bg-purple-100 text-purple-800',
      english: 'bg-pink-100 text-pink-800',
      history: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[subject.toLowerCase() as keyof typeof colors] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>AI Question Retrieval</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search by Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="math">Math</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Search by Task</label>
              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a homework task..." />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title} ({task.subject})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={() => searchQuestions()} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Questions
                </>
              )}
            </Button>
            
            {selectedTask && (
              <Button variant="outline" onClick={() => searchForTask(selectedTask)} disabled={isLoading}>
                <Brain className="w-4 h-4 mr-2" />
                Questions for Selected Task
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Task Actions */}
      {tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Search by Homework</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-3">
                    {task.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <div>
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge variant="secondary" className={getSubjectColor(task.subject)}>
                        {task.subject}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => searchForTask(task.id)}>
                    <Search className="w-3 h-3 mr-1" />
                    Find Questions
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Retrieved Questions */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Educational Questions ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900 flex-1 pr-4">{question.question}</h3>
                    {question.url && (
                      <Button size="sm" variant="ghost" className="text-blue-600" asChild>
                        <a href={question.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Badge variant="secondary" className={getSubjectColor(question.subject)}>
                      {question.subject}
                    </Badge>
                    <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                    <span className="text-gray-500">Source: {question.source}</span>
                  </div>
                  
                  {question.relatedTask && (
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        Related to: {tasks.find(t => t.id === question.relatedTask)?.title}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {questions.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No questions retrieved yet. Use the search options above to find educational content.</p>
            <p className="text-sm text-gray-400">Questions will be sourced from Khan Academy, MIT OpenCourseWare, and other trusted educational platforms.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionRetriever;

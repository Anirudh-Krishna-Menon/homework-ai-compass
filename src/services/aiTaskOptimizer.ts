
import { HomeworkNLP } from './homeworkNLP';

export interface TaskOptimization {
  suggestedPriority: 'low' | 'medium' | 'high';
  suggestedDeadline: Date;
  confidence: number;
  reasoning: string;
}

export interface OptimizedTask {
  id: string;
  title: string;
  description: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  completed: boolean;
  source: 'ai' | 'manual';
  aiSuggestion?: TaskOptimization;
  userOverrides?: {
    priority?: boolean;
    deadline?: boolean;
  };
}

export class AITaskOptimizer {
  private nlpProcessor: HomeworkNLP;
  
  constructor() {
    this.nlpProcessor = new HomeworkNLP();
  }

  analyzeAndSuggestOptimizations(task: any): TaskOptimization {
    const now = new Date();
    const taskDeadline = new Date(task.deadline);
    const daysUntilDeadline = Math.ceil((taskDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Rule-based priority adjustment
    let suggestedPriority: 'low' | 'medium' | 'high' = task.priority;
    let reasoning = '';
    let confidence = 0.7;

    // Priority rules based on deadline proximity
    if (daysUntilDeadline <= 1) {
      suggestedPriority = 'high';
      reasoning = 'Task is due within 24 hours - marked as high priority';
      confidence = 0.95;
    } else if (daysUntilDeadline <= 3) {
      suggestedPriority = 'high';
      reasoning = 'Task is due within 3 days - increased to high priority';
      confidence = 0.85;
    } else if (daysUntilDeadline <= 7) {
      suggestedPriority = 'medium';
      reasoning = 'Task is due within a week - maintained as medium priority';
      confidence = 0.75;
    } else if (daysUntilDeadline > 14) {
      suggestedPriority = 'low';
      reasoning = 'Task has flexible deadline - can be low priority';
      confidence = 0.70;
    }

    // Subject-based priority adjustments
    if (task.subject === 'math' && daysUntilDeadline <= 5) {
      suggestedPriority = 'high';
      reasoning += ' (Math assignments often require more preparation time)';
      confidence += 0.1;
    }

    // Assignment type considerations
    const description = task.description.toLowerCase();
    if (description.includes('exam') || description.includes('test')) {
      suggestedPriority = 'high';
      reasoning = 'Exam/test detected - automatically high priority';
      confidence = 0.9;
    } else if (description.includes('project') && daysUntilDeadline <= 7) {
      suggestedPriority = 'high';
      reasoning += ' (Projects require extended work time)';
      confidence += 0.05;
    }

    // Deadline optimization
    let suggestedDeadline = taskDeadline;
    
    // Suggest earlier deadline for complex tasks
    if (description.includes('project') || description.includes('research')) {
      const bufferDays = Math.max(1, Math.floor(daysUntilDeadline * 0.1));
      suggestedDeadline = new Date(taskDeadline);
      suggestedDeadline.setDate(suggestedDeadline.getDate() - bufferDays);
      reasoning += ` Suggested ${bufferDays} day(s) buffer for complex task.`;
    }

    return {
      suggestedPriority,
      suggestedDeadline,
      confidence: Math.min(confidence, 1),
      reasoning
    };
  }

  // Analyze multiple tasks for workload balance
  analyzeWorkloadBalance(tasks: any[]): Map<string, TaskOptimization> {
    const optimizations = new Map<string, TaskOptimization>();
    
    // Group tasks by deadline proximity
    const tasksByDeadline = tasks
      .filter(task => !task.completed)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    // Check for deadline clustering
    const now = new Date();
    let currentWeekTasks = 0;
    
    tasksByDeadline.forEach((task, index) => {
      const daysUntilDeadline = Math.ceil((new Date(task.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDeadline <= 7) {
        currentWeekTasks++;
      }
      
      let optimization = this.analyzeAndSuggestOptimizations(task);
      
      // Workload balancing adjustments
      if (currentWeekTasks > 3 && task.priority === 'high' && daysUntilDeadline > 2) {
        optimization.suggestedPriority = 'medium';
        optimization.reasoning += ' (Workload balancing: too many high-priority tasks this week)';
        optimization.confidence *= 0.8;
      }
      
      optimizations.set(task.id, optimization);
    });
    
    return optimizations;
  }

  // Store user feedback for learning
  recordUserFeedback(taskId: string, acceptedSuggestion: boolean, userChoice: any) {
    // Store in localStorage for now - in production this would go to a database
    const feedback = {
      taskId,
      acceptedSuggestion,
      userChoice,
      timestamp: new Date().toISOString()
    };
    
    const existingFeedback = JSON.parse(localStorage.getItem('ai_feedback') || '[]');
    existingFeedback.push(feedback);
    localStorage.setItem('ai_feedback', JSON.stringify(existingFeedback));
    
    console.log('AI feedback recorded:', feedback);
  }
}

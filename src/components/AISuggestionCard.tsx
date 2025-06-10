
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { TaskOptimization } from '@/services/aiTaskOptimizer';

interface AISuggestionCardProps {
  taskId: string;
  currentPriority: 'low' | 'medium' | 'high';
  currentDeadline: string;
  suggestion: TaskOptimization;
  onAccept: (taskId: string, suggestion: TaskOptimization) => void;
  onReject: (taskId: string) => void;
}

const AISuggestionCard: React.FC<AISuggestionCardProps> = ({
  taskId,
  currentPriority,
  currentDeadline,
  suggestion,
  onAccept,
  onReject
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-3 h-3" />;
      case 'medium': return <Clock className="w-3 h-3" />;
      case 'low': return <CheckCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const hasChanges = currentPriority !== suggestion.suggestedPriority || 
                    new Date(currentDeadline).getTime() !== suggestion.suggestedDeadline.getTime();

  if (!hasChanges) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">AI Suggestion</span>
            <Badge variant="outline" className="text-xs">
              {Math.round(suggestion.confidence * 100)}% confidence
            </Badge>
          </div>
          <div className="flex space-x-1">
            <Button
              size="sm"
              onClick={() => onAccept(taskId, suggestion)}
              className="h-7 text-xs"
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(taskId)}
              className="h-7 text-xs"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {currentPriority !== suggestion.suggestedPriority && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Priority:</span>
              <div className="flex items-center space-x-2">
                <Badge className={getPriorityColor(currentPriority)}>
                  {getPriorityIcon(currentPriority)}
                  <span className="ml-1">{currentPriority}</span>
                </Badge>
                <span className="text-gray-400">→</span>
                <Badge className={getPriorityColor(suggestion.suggestedPriority)}>
                  {getPriorityIcon(suggestion.suggestedPriority)}
                  <span className="ml-1">{suggestion.suggestedPriority}</span>
                </Badge>
              </div>
            </div>
          )}

          {new Date(currentDeadline).getTime() !== suggestion.suggestedDeadline.getTime() && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Deadline:</span>
              <div className="flex items-center space-x-2 text-xs">
                <span>{new Date(currentDeadline).toLocaleDateString()}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium">{suggestion.suggestedDeadline.toLocaleDateString()}</span>
              </div>
            </div>
          )}

          <div className="mt-2 p-2 bg-white rounded text-xs text-gray-700">
            <strong>Why:</strong> {suggestion.reasoning}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISuggestionCard;

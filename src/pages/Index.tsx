
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Circle, BookOpen, Brain, Search, Settings, Plus, Calendar, Clock } from 'lucide-react';
import AdminPanel from '@/components/AdminPanel';
import HomeworkExtractor from '@/components/HomeworkExtractor';
import TaskManager from '@/components/TaskManager';
import QuestionRetriever from '@/components/QuestionRetriever';

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

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  useEffect(() => {
    // Check admin status on load
    checkAdminStatus();
    // Load saved tasks
    loadTasks();
  }, []);

  const checkAdminStatus = () => {
    const adminKey = localStorage.getItem('homework_admin');
    const macAddress = localStorage.getItem('admin_mac_address');
    
    if (adminKey === 'admin_authenticated' || macAddress) {
      setIsAdmin(true);
      toast({
        title: "Admin Access Granted",
        description: "Welcome back! You have full admin privileges.",
      });
    }
  };

  const loadTasks = () => {
    const savedTasks = localStorage.getItem('homework_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  };

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('homework_tasks', JSON.stringify(newTasks));
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = {
      ...task,
      id: Date.now().toString()
    };
    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    toast({
      title: "Task Added",
      description: `"${task.title}" has been added to your homework list.`,
    });
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">AI Homework Assistant</h1>
            </div>
            {isAdmin && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Admin Access
              </Badge>
            )}
          </div>
          
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Due Today</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {tasks.filter(task => 
                        new Date(task.deadline).toDateString() === new Date().toDateString()
                      ).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="extract">Extract Tasks</TabsTrigger>
            <TabsTrigger value="manage">Manage Tasks</TabsTrigger>
            <TabsTrigger value="questions">AI Questions</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Task Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Your Homework</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No homework tasks yet. Start by extracting tasks from messages or adding them manually.</p>
                    <Button onClick={() => setActiveTab('extract')} className="mr-2">
                      <Plus className="w-4 h-4 mr-2" />
                      Extract Tasks
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('manage')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Manually
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                        <button onClick={() => toggleTask(task.id)}>
                          {task.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className={getSubjectColor(task.subject)}>
                              {task.subject}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <span className="text-sm text-gray-500">Due: {new Date(task.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {tasks.length > 5 && (
                      <Button variant="ghost" onClick={() => setActiveTab('manage')} className="w-full">
                        View All Tasks ({tasks.length})
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="extract">
            <HomeworkExtractor onTasksExtracted={addTask} />
          </TabsContent>

          <TabsContent value="manage">
            <TaskManager 
              tasks={tasks} 
              onTasksUpdate={saveTasks}
              onTaskToggle={toggleTask}
              onTaskAdd={addTask}
            />
          </TabsContent>

          <TabsContent value="questions">
            <QuestionRetriever tasks={tasks} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <AdminPanel onAdminStatusChange={setIsAdmin} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

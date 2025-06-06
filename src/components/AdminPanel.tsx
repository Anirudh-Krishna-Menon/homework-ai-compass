
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings, Shield, Key, Monitor, Database, Code } from 'lucide-react';

interface AdminPanelProps {
  onAdminStatusChange: (isAdmin: boolean) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onAdminStatusChange }) => {
  const [macAddress, setMacAddress] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [systemInfo, setSystemInfo] = useState({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    onlineStatus: navigator.onLine
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check current admin status
    const adminKey = localStorage.getItem('homework_admin');
    const savedMac = localStorage.getItem('admin_mac_address');
    
    if (adminKey === 'admin_authenticated') {
      toast({
        title: "Admin Status",
        description: "You are currently authenticated as admin.",
      });
    }
    
    if (savedMac) {
      setMacAddress(savedMac);
    }
  }, []);

  const handleMacAuthentication = () => {
    if (!macAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a MAC address.",
        variant: "destructive"
      });
      return;
    }

    // Validate MAC address format (basic validation)
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(macAddress)) {
      toast({
        title: "Invalid Format",
        description: "Please enter a valid MAC address (e.g., 00:1B:44:11:3A:B7).",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('admin_mac_address', macAddress);
    localStorage.setItem('homework_admin', 'admin_authenticated');
    onAdminStatusChange(true);
    
    toast({
      title: "MAC Address Registered",
      description: "This device is now recognized as an admin device.",
    });
  };

  const handlePasswordAuthentication = async () => {
    if (!adminPassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter the admin password.",
        variant: "destructive"
      });
      return;
    }

    setIsAuthenticating(true);
    
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple password check (in production, this would be server-side)
    if (adminPassword === 'admin123' || adminPassword === 'homework_admin_2024') {
      localStorage.setItem('homework_admin', 'admin_authenticated');
      onAdminStatusChange(true);
      setAdminPassword('');
      
      toast({
        title: "Authentication Successful",
        description: "You now have admin access to the system.",
      });
    } else {
      toast({
        title: "Authentication Failed",
        description: "Incorrect admin password. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsAuthenticating(false);
  };

  const clearAdminAccess = () => {
    localStorage.removeItem('homework_admin');
    localStorage.removeItem('admin_mac_address');
    onAdminStatusChange(false);
    setMacAddress('');
    setAdminPassword('');
    
    toast({
      title: "Admin Access Revoked",
      description: "Admin privileges have been removed from this device.",
    });
  };

  const exportData = () => {
    const tasks = localStorage.getItem('homework_tasks');
    if (tasks) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(tasks);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `homework_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: "Data Exported",
        description: "Homework data has been exported successfully.",
      });
    } else {
      toast({
        title: "No Data",
        description: "No homework data found to export.",
        variant: "destructive"
      });
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all homework data? This action cannot be undone.')) {
      localStorage.removeItem('homework_tasks');
      toast({
        title: "Data Cleared",
        description: "All homework data has been cleared from the system.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Admin Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* MAC Address Authentication */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <h3 className="font-medium">Device Recognition (MAC Address)</h3>
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter MAC address (e.g., 00:1B:44:11:3A:B7)"
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleMacAuthentication}>
                Register Device
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Register this device's MAC address for automatic admin recognition.
            </p>
          </div>

          <div className="border-t pt-4" />

          {/* Password Authentication */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <h3 className="font-medium">Password Authentication</h3>
            </div>
            <div className="flex space-x-2">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handlePasswordAuthentication} disabled={isAuthenticating}>
                {isAuthenticating ? 'Authenticating...' : 'Login'}
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Use the admin password for temporary access. (Demo: admin123)
            </p>
          </div>

          <div className="border-t pt-4" />

          <Button variant="outline" onClick={clearAdminAccess} className="w-full text-red-600 border-red-200 hover:bg-red-50">
            Revoke Admin Access
          </Button>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="w-5 h-5" />
            <span>System Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Platform:</span>
              <Badge variant="secondary">{systemInfo.platform}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Language:</span>
              <Badge variant="secondary">{systemInfo.language}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cookies Enabled:</span>
              <Badge variant={systemInfo.cookiesEnabled ? "default" : "destructive"}>
                {systemInfo.cookiesEnabled ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Online Status:</span>
              <Badge variant={systemInfo.onlineStatus ? "default" : "destructive"}>
                {systemInfo.onlineStatus ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <div className="pt-2">
              <span className="text-gray-600">User Agent:</span>
              <p className="text-xs text-gray-500 mt-1 break-all">{systemInfo.userAgent}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={exportData} variant="outline">
              <Database className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={clearAllData} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              <Database className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Export your homework data for backup or clear all data to start fresh.
          </p>
        </CardContent>
      </Card>

      {/* HTML Editing Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="w-5 h-5" />
            <span>HTML Editing & Customization</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              This application is built with React and allows for full customization through the source code.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium">Available Features:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Full access to component structure</li>
                <li>Customizable styling with Tailwind CSS</li>
                <li>Extensible AI processing logic</li>
                <li>Local storage data management</li>
                <li>Responsive mobile-friendly design</li>
              </ul>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Source code fully accessible for modifications
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;

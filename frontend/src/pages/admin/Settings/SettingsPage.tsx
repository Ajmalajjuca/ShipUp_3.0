import React from 'react';
import Card from '../../../components/common/Card/Card';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import { Save, Lock, Bell, User } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <Card className="p-6">
        <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
            <User className="mr-3 text-indigo-600" size={24} />
            <div>
                <h2 className="text-lg font-semibold text-gray-800">Profile Settings</h2>
                <p className="text-sm text-gray-500">Update your personal information</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" defaultValue="Admin User" fullWidth />
            <Input label="Email Address" defaultValue="admin@shipup.com" type="email" fullWidth />
            <Input label="Phone Number" defaultValue="+91 98765 43210" fullWidth />
            <Input label="Designation" defaultValue="Super Admin" disabled fullWidth />
        </div>
        
        <div className="mt-6 flex justify-end">
            <Button variant="primary" leftIcon={<Save size={18} />}>Save Changes</Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
            <Lock className="mr-3 text-indigo-600" size={24} />
             <div>
                <h2 className="text-lg font-semibold text-gray-800">Security</h2>
                <p className="text-sm text-gray-500">Change your password and security settings</p>
            </div>
        </div>

        <div className="space-y-4 max-w-md">
            <Input label="Current Password" type="password" fullWidth />
            <Input label="New Password" type="password" fullWidth />
            <Input label="Confirm New Password" type="password" fullWidth />
        </div>

         <div className="mt-6 flex justify-end">
            <Button variant="secondary">Update Password</Button>
        </div>
      </Card>

      <Card className="p-6">
         <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
            <Bell className="mr-3 text-indigo-600" size={24} />
             <div>
                <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
                <p className="text-sm text-gray-500">Manage your notification preferences</p>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-gray-700">Email Notifications</span>
                <input type="checkbox" className="h-5 w-5 text-indigo-600 rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
                <span className="text-gray-700">Push Notifications</span>
                <input type="checkbox" className="h-5 w-5 text-indigo-600 rounded" defaultChecked />
            </div>
             <div className="flex items-center justify-between">
                <span className="text-gray-700">SMS Alerts</span>
                <input type="checkbox" className="h-5 w-5 text-indigo-600 rounded" />
            </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;

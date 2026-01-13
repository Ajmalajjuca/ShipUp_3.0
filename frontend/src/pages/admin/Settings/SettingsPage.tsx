import React from 'react';
import { Card } from '../../../components/common';

const SettingsPage: React.FC = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      <p className="text-gray-600">Application settings will be displayed here</p>
    </Card>
  );
};

export default SettingsPage;

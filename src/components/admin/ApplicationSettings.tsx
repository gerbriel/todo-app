import React, { useState } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

interface Setting {
  setting_key: string;
  setting_value: any;
  description: string;
}

const ApplicationSettings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [settings, setSettings] = useState<Setting[]>([
    {
      setting_key: 'default_board_template',
      setting_value: 'kanban',
      description: 'Default board template for new users'
    },
    {
      setting_key: 'max_cards_per_list',
      setting_value: 100,
      description: 'Maximum number of cards allowed per list'
    },
    {
      setting_key: 'allow_guest_access',
      setting_value: true,
      description: 'Whether to allow guest users'
    },
    {
      setting_key: 'enable_email_notifications',
      setting_value: false,
      description: 'Enable email notifications system'
    },
    {
      setting_key: 'app_maintenance_mode',
      setting_value: false,
      description: 'Enable maintenance mode'
    },
    {
      setting_key: 'auto_archive_enabled',
      setting_value: false,
      description: 'Auto-archive completed cards'
    },
    {
      setting_key: 'auto_archive_days',
      setting_value: 30,
      description: 'Days after completion before auto-archiving (if enabled)'
    },
    {
      setting_key: 'require_email_verification',
      setting_value: true,
      description: 'Require users to verify their email address'
    },
    {
      setting_key: 'password_min_length',
      setting_value: 8,
      description: 'Minimum password length'
    },
    {
      setting_key: 'session_timeout_minutes',
      setting_value: 60,
      description: 'User session timeout in minutes'
    }
  ]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => prev.map(s => 
      s.setting_key === key ? { ...s, setting_value: value } : s
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // In a real implementation, you would save to Supabase:
      // for (const setting of settings) {
      //   await supabase
      //     .from('admin_settings')
      //     .upsert({
      //       setting_key: setting.setting_key,
      //       setting_value: setting.setting_value,
      //       description: setting.description,
      //       updated_by: user?.id
      //     });
      // }

      // Mock save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus({ 
        type: 'success', 
        message: 'Settings saved successfully!' 
      });

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ 
        type: 'error', 
        message: 'Failed to save settings. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderSettingInput = (setting: Setting) => {
    const { setting_key, setting_value, description } = setting;

    if (typeof setting_value === 'boolean') {
      return (
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={setting_value}
            onChange={(e) => handleSettingChange(setting_key, e.target.checked)}
            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <span className="text-gray-700">{description}</span>
        </label>
      );
    }

    if (typeof setting_value === 'number') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {description}
          </label>
          <input
            type="number"
            value={setting_value}
            onChange={(e) => handleSettingChange(setting_key, parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      );
    }

    // String inputs
    if (setting_key.includes('template')) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {description}
          </label>
          <select
            value={setting_value}
            onChange={(e) => handleSettingChange(setting_key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="kanban">Kanban</option>
            <option value="scrum">Scrum</option>
            <option value="simple">Simple List</option>
          </select>
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {description}
        </label>
        <input
          type="text"
          value={setting_value}
          onChange={(e) => handleSettingChange(setting_key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Application Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure global application settings
        </p>
      </div>

      {/* Status Message */}
      {saveStatus && (
        <div className={`mb-6 p-4 rounded-md ${
          saveStatus.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {saveStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            )}
            <p className={`text-sm font-medium ${
              saveStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {saveStatus.message}
            </p>
          </div>
        </div>
      )}

      {/* Settings Grid */}
      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General</h3>
          <div className="space-y-4">
            {settings.filter(s => 
              ['default_board_template', 'max_cards_per_list', 'allow_guest_access'].includes(s.setting_key)
            ).map(setting => (
              <div key={setting.setting_key} className="bg-white p-4 rounded border border-gray-200">
                {renderSettingInput(setting)}
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Archive Settings */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Archive</h3>
          <div className="space-y-4">
            {settings.filter(s => 
              s.setting_key.includes('auto_archive')
            ).map(setting => (
              <div key={setting.setting_key} className="bg-white p-4 rounded border border-gray-200">
                {renderSettingInput(setting)}
              </div>
            ))}
          </div>
        </div>

        {/* Security & Authentication */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Authentication</h3>
          <div className="space-y-4">
            {settings.filter(s => 
              ['require_email_verification', 'password_min_length', 'session_timeout_minutes'].includes(s.setting_key)
            ).map(setting => (
              <div key={setting.setting_key} className="bg-white p-4 rounded border border-gray-200">
                {renderSettingInput(setting)}
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-4">
            {settings.filter(s => 
              s.setting_key.includes('notification') || s.setting_key.includes('email')
            ).map(setting => (
              <div key={setting.setting_key} className="bg-white p-4 rounded border border-gray-200">
                {renderSettingInput(setting)}
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance</h3>
          <div className="space-y-4">
            {settings.filter(s => 
              s.setting_key.includes('maintenance')
            ).map(setting => (
              <div key={setting.setting_key} className="bg-white p-4 rounded border border-gray-200">
                {renderSettingInput(setting)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default ApplicationSettings;

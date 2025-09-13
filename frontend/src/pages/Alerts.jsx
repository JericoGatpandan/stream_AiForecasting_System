import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Plus, Edit, Trash2, MapPin, Settings, Clock } from 'lucide-react';
import { weatherService } from '../services/weatherService';

function Alerts() {
  const [activeTab, setActiveTab] = useState('notifications'); // notifications, triggers, settings
  const [notifications, setNotifications] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTrigger, setShowAddTrigger] = useState(false);
  const [newTrigger, setNewTrigger] = useState({
    name: '',
    location: '',
    latitude: 0,
    longitude: 0,
    condition_type: 'temperature',
    operator: 'greater_than',
    threshold_value: 0,
    notification_method: 'in_app'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notificationsData, triggersData] = await Promise.all([
        weatherService.getNotifications(),
        weatherService.getWeatherTriggers()
      ]);
      setNotifications(notificationsData);
      setTriggers(triggersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrigger = async () => {
    try {
      await weatherService.addWeatherTrigger(newTrigger);
      setShowAddTrigger(false);
      setNewTrigger({
        name: '',
        location: '',
        latitude: 0,
        longitude: 0,
        condition_type: 'temperature',
        operator: 'greater_than',
        threshold_value: 0,
        notification_method: 'in_app'
      });
      fetchData();
    } catch (error) {
      console.error('Error adding trigger:', error);
    }
  };

  const handleDeleteTrigger = async (id) => {
    try {
      await weatherService.deleteWeatherTrigger(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting trigger:', error);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await weatherService.markNotificationAsRead(id);
      fetchData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'info': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getAlertTypeColor = (type) => {
    switch (type) {
      case 'severe_weather': return 'text-red-600 bg-red-100';
      case 'flood_warning': return 'text-blue-600 bg-blue-100';
      case 'storm_warning': return 'text-purple-600 bg-purple-100';
      case 'heat_warning': return 'text-orange-600 bg-orange-100';
      case 'cold_warning': return 'text-cyan-600 bg-cyan-100';
      case 'wind_warning': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Weather Alerts & Notifications</h1>
          <p className="text-gray-600">Stay informed with timely weather updates and custom alerts</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('triggers')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'triggers'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Weather Triggers
          </button>
        </div>

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Recent Notifications</h2>
              <span className="text-sm text-gray-500">
                {notifications.filter(n => !n.is_read).length} unread
              </span>
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      notification.is_read ? 'bg-gray-50' : 'bg-white'
                    } ${getSeverityColor(notification.severity)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          <h3 className="font-semibold">{notification.title}</h3>
                          {!notification.is_read && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{notification.message}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          {notification.location && (
                            <>
                              <MapPin className="w-3 h-3 mr-1" />
                              <span className="mr-4">{notification.location}</span>
                            </>
                          )}
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{new Date(notification.sent_at).toLocaleString()}</span>
                        </div>
                      </div>
                      {!notification.is_read && (
                        <button
                          onClick={() => markNotificationAsRead(notification.id)}
                          className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            )}
          </div>
        )}

        {/* Triggers Tab */}
        {activeTab === 'triggers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Weather Triggers</h2>
              <button
                onClick={() => setShowAddTrigger(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Trigger
              </button>
            </div>

            {/* Add Trigger Modal */}
            {showAddTrigger && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Add Weather Trigger</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={newTrigger.name}
                        onChange={(e) => setNewTrigger({...newTrigger, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="e.g., High Temperature Alert"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={newTrigger.location}
                        onChange={(e) => setNewTrigger({...newTrigger, location: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="e.g., Naga City"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                        <select
                          value={newTrigger.condition_type}
                          onChange={(e) => setNewTrigger({...newTrigger, condition_type: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="temperature">Temperature</option>
                          <option value="precipitation">Precipitation</option>
                          <option value="wind_speed">Wind Speed</option>
                          <option value="humidity">Humidity</option>
                          <option value="visibility">Visibility</option>
                          <option value="uv_index">UV Index</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                        <select
                          value={newTrigger.operator}
                          onChange={(e) => setNewTrigger({...newTrigger, operator: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="greater_than">Greater Than</option>
                          <option value="less_than">Less Than</option>
                          <option value="equals">Equals</option>
                          <option value="greater_equal">Greater or Equal</option>
                          <option value="less_equal">Less or Equal</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Threshold Value</label>
                      <input
                        type="number"
                        value={newTrigger.threshold_value}
                        onChange={(e) => setNewTrigger({...newTrigger, threshold_value: parseFloat(e.target.value)})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="e.g., 30"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowAddTrigger(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddTrigger}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Trigger
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Triggers List */}
            {triggers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {triggers.map((trigger) => (
                  <div key={trigger.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-800">{trigger.name}</h3>
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTrigger(trigger.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-2 text-gray-400" />
                        <span>{trigger.location}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Condition:</span>
                        <span className="ml-2 capitalize">{trigger.condition_type}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Alert when:</span>
                        <span className="ml-2">
                          {trigger.condition_type} {trigger.operator.replace('_', ' ')} {trigger.threshold_value}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Status:</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          trigger.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {trigger.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {trigger.last_triggered && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>Last triggered: {new Date(trigger.last_triggered).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No weather triggers configured</p>
                <p className="text-sm text-gray-400 mt-2">Create your first trigger to get started</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Alerts;

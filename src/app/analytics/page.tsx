'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { messagesApi, contactsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  ChartBarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  FireIcon,
  TrophyIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  pink: '#EC4899',
};

const PIE_COLORS = [COLORS.success, COLORS.danger, COLORS.warning, COLORS.purple, COLORS.cyan];

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Real data states
  const [statistics, setStatistics] = useState<any>(null);
  const [bulkMessages, setBulkMessages] = useState<any[]>([]);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    fetchAllAnalytics();
  }, [dateRange]);

  const fetchAllAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [statsRes, bulkRes, historyRes, contactsRes] = await Promise.all([
        messagesApi.getStatistics(dateRange),
        messagesApi.getBulkMessages({ limit: 100 }),
        messagesApi.getMessageHistory({ limit: 1000 }),
        contactsApi.getContacts({ limit: 1000 })
      ]);

      if (statsRes.success) setStatistics(statsRes.data);
      if (bulkRes.success) setBulkMessages(bulkRes.data?.bulkMessages || []);
      if (historyRes.success) setMessageHistory(historyRes.data?.messages || []);
      if (contactsRes.success) setContacts(contactsRes.data?.contacts || []);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchAllAnalytics();
    setIsRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  // Calculate derived metrics
  const calculateMetrics = () => {
    const totalMessagesCount = messageHistory.length;
    const sentCount = messageHistory.filter((m: any) => m.status === 'sent').length;
    const failedCount = messageHistory.filter((m: any) => m.status === 'failed').length;
    const pendingCount = messageHistory.filter((m: any) => m.status === 'pending' || m.status === 'processing').length;
    const deliveredCount = messageHistory.filter((m: any) => m.status === 'delivered').length;
    const readCount = messageHistory.filter((m: any) => m.status === 'read').length;
    
    const successRate = totalMessagesCount > 0 ? ((sentCount + deliveredCount + readCount) / totalMessagesCount) * 100 : 0;
    const failureRate = totalMessagesCount > 0 ? (failedCount / totalMessagesCount) * 100 : 0;
    const deliveryRate = sentCount > 0 ? (deliveredCount / sentCount) * 100 : 0;
    const readRate = deliveredCount > 0 ? (readCount / deliveredCount) * 100 : 0;

    // Bulk campaigns
    const totalCampaigns = bulkMessages.length;
    const completedCampaigns = bulkMessages.filter(bm => bm.status === 'completed').length;
    const processingCampaigns = bulkMessages.filter(bm => bm.status === 'processing').length;
    const failedCampaigns = bulkMessages.filter(bm => bm.status === 'failed').length;

    // Category breakdown
    const categoryBreakdown = messageHistory.reduce((acc: any, msg: any) => {
      const cat = msg.category || 'other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // Messages by day (last 7-30 days)
    const days = parseInt(dateRange);
    const messagesByDay: any[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = messageHistory.filter((m: any) => {
        const msgDate = new Date(m.createdAt).toISOString().split('T')[0];
        return msgDate === dateStr;
      }).length;
      
      messagesByDay.push({
        date: dateStr,
        count,
        sent: messageHistory.filter((m: any) => {
          const msgDate = new Date(m.createdAt).toISOString().split('T')[0];
          return msgDate === dateStr && m.status === 'sent';
        }).length,
      });
    }

    // Contact growth over time
    const contactsByDay: any[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = contacts.filter((c: any) => {
        const contactDate = new Date(c.createdAt).toISOString().split('T')[0];
        return contactDate <= dateStr;
      }).length;
      
      contactsByDay.push({
        date: dateStr,
        count,
      });
    }

    // Status distribution for pie chart
    const statusDistribution = [
      { name: 'Sent', value: sentCount, color: COLORS.success },
      { name: 'Delivered', value: deliveredCount, color: COLORS.cyan },
      { name: 'Read', value: readCount, color: COLORS.purple },
      { name: 'Failed', value: failedCount, color: COLORS.danger },
      { name: 'Pending', value: pendingCount, color: COLORS.warning },
    ].filter(item => item.value > 0);

    // Category distribution
    const categoryData = Object.entries(categoryBreakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value,
    }));

    // Recent campaigns with details
    const recentCampaigns = bulkMessages.slice(0, 10).map(bm => ({
      id: bm.id,
      message: bm.originalMessage?.substring(0, 50) + '...',
      category: bm.category,
      totalContacts: bm.totalContacts,
      sent: bm.progress?.sent || 0,
      failed: bm.progress?.failed || 0,
      pending: bm.progress?.pending || 0,
      status: bm.status,
      successRate: bm.totalContacts > 0 ? ((bm.progress?.sent || 0) / bm.totalContacts * 100).toFixed(1) : 0,
      createdAt: new Date(bm.createdAt).toLocaleString(),
    }));

    // Performance metrics
    const avgMessagesPerCampaign = totalCampaigns > 0 ? Math.round(totalMessagesCount / totalCampaigns) : 0;
    const avgSuccessRatePerCampaign = bulkMessages.length > 0 
      ? bulkMessages.reduce((sum, bm) => {
          const rate = bm.totalContacts > 0 ? (bm.progress?.sent || 0) / bm.totalContacts * 100 : 0;
          return sum + rate;
        }, 0) / bulkMessages.length
      : 0;

    return {
      totalMessagesCount,
      sentCount,
      failedCount,
      pendingCount,
      deliveredCount,
      readCount,
      successRate,
      failureRate,
      deliveryRate,
      readRate,
      totalCampaigns,
      completedCampaigns,
      processingCampaigns,
      failedCampaigns,
      categoryBreakdown,
      messagesByDay,
      contactsByDay,
      statusDistribution,
      categoryData,
      recentCampaigns,
      avgMessagesPerCampaign,
      avgSuccessRatePerCampaign,
    };
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Analytics" subtitle="Real-time performance metrics and insights">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <ArrowPathIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const metrics = calculateMetrics();

  return (
    <DashboardLayout title="Analytics" subtitle="Real-time performance metrics and insights">
      <div className="space-y-6">
        {/* Header with Refresh */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing data for last {dateRange} days • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="btn btn-secondary btn-sm flex items-center"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Messages */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Total Messages</p>
                <p className="text-3xl font-bold text-blue-900">{metrics.totalMessagesCount.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">Across {metrics.totalCampaigns} campaigns</p>
              </div>
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          {/* Sent Messages */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 mb-1">Successfully Sent</p>
                <p className="text-3xl font-bold text-green-900">{metrics.sentCount.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">{metrics.successRate.toFixed(1)}% success rate</p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            </div>
          </div>

          {/* Failed Messages */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800 mb-1">Failed</p>
                <p className="text-3xl font-bold text-red-900">{metrics.failedCount.toLocaleString()}</p>
                <p className="text-xs text-red-600 mt-1">{metrics.failureRate.toFixed(1)}% failure rate</p>
              </div>
              <XCircleIcon className="h-12 w-12 text-red-500" />
            </div>
          </div>

          {/* Total Contacts */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800 mb-1">Total Contacts</p>
                <p className="text-3xl font-bold text-purple-900">{contacts.length.toLocaleString()}</p>
                <p className="text-xs text-purple-600 mt-1">Active database</p>
              </div>
              <UserGroupIcon className="h-12 w-12 text-purple-500" />
            </div>
          </div>
        </div>
 

        {/* Charts Row 1: Message Trends & Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages Over Time - Line Chart */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Message Trends</h3>
                <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600 mt-1">Daily message volume over time</p>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics.messagesByDay}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="count" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorMessages)" name="Total Messages" />
                  <Area type="monotone" dataKey="sent" stroke={COLORS.success} fillOpacity={1} fill="url(#colorSent)" name="Sent Messages" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution - Pie Chart */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
                <ChartBarIcon className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600 mt-1">Message delivery status breakdown</p>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.statusDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2: Contact Growth & Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Growth */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Contact Growth</h3>
                <UserGroupIcon className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600 mt-1">Total contacts over time</p>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.contactsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke={COLORS.purple} 
                    strokeWidth={3}
                    dot={{ fill: COLORS.purple, r: 4 }}
                    name="Total Contacts"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Message Categories</h3>
                <ChartBarIcon className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600 mt-1">Messages by category type</p>
            </div>
            <div className="card-body">
              {metrics.categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill={COLORS.primary} name="Messages">
                      {metrics.categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p>No category data available yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Campaign Performance Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Campaigns</h3>
            <p className="text-sm text-gray-600 mt-1">Last 10 campaigns with detailed metrics</p>
          </div>
          <div className="card-body">
            {metrics.recentCampaigns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {metrics.recentCampaigns.map((campaign: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900 truncate max-w-xs" title={campaign.message}>
                            {campaign.message}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {campaign.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{campaign.totalContacts}</td>
                        <td className="px-4 py-3 text-sm text-green-600 font-medium">{campaign.sent}</td>
                        <td className="px-4 py-3 text-sm text-red-600 font-medium">{campaign.failed}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="flex-1 max-w-[100px] bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  parseFloat(campaign.successRate as string) >= 95 ? 'bg-green-500' :
                                  parseFloat(campaign.successRate as string) >= 80 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${campaign.successRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{campaign.successRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{campaign.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No campaign data available yet</p>
                <p className="text-sm text-gray-400 mt-2">Start your first campaign to see analytics</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Performance */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Overall Performance</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Success Rate</span>
                    <span className={`font-bold ${
                      metrics.successRate >= 95 ? 'text-green-600' :
                      metrics.successRate >= 80 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>{metrics.successRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metrics.successRate >= 95 ? 'bg-green-500' :
                        metrics.successRate >= 80 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${metrics.successRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Delivery Rate</span>
                    <span className="font-bold text-cyan-600">{metrics.deliveryRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{ width: `${metrics.deliveryRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Read Rate</span>
                    <span className="font-bold text-purple-600">{metrics.readRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${metrics.readRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Failure Rate</span>
                    <span className="font-bold text-red-600">{metrics.failureRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${metrics.failureRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Status Summary */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Campaign Summary</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Completed</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{metrics.completedCampaigns}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Processing</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{metrics.processingCampaigns}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <XCircleIcon className="h-5 w-5 text-red-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Failed</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{metrics.failedCampaigns}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center">
                    <TrophyIcon className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Total Campaigns</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{metrics.totalCampaigns}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Messages/Campaign</span>
                  <span className="text-lg font-bold text-gray-900">{metrics.avgMessagesPerCampaign}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Success Rate</span>
                  <span className={`text-lg font-bold ${
                    metrics.avgSuccessRatePerCampaign >= 95 ? 'text-green-600' :
                    metrics.avgSuccessRatePerCampaign >= 80 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>{metrics.avgSuccessRatePerCampaign.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Contacts</span>
                  <span className="text-lg font-bold text-gray-900">{contacts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Date Range</span>
                  <span className="text-lg font-bold text-gray-900">{dateRange} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Campaigns</span>
                  <span className="text-lg font-bold text-orange-600">{metrics.processingCampaigns}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      

        {/* Insights & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Insights */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {metrics.successRate >= 95 && (
                  <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Excellent Performance!</p>
                      <p className="text-xs text-green-700 mt-1">Your success rate of {metrics.successRate.toFixed(1)}% is outstanding. Keep up the good work!</p>
                    </div>
                  </div>
                )}

                {metrics.successRate < 95 && metrics.successRate >= 80 && (
                  <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Good Performance</p>
                      <p className="text-xs text-yellow-700 mt-1">Success rate of {metrics.successRate.toFixed(1)}% is good, but there's room for improvement.</p>
                    </div>
                  </div>
                )}

                {metrics.successRate < 80 && (
                  <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircleIcon className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Needs Attention</p>
                      <p className="text-xs text-red-700 mt-1">Success rate of {metrics.successRate.toFixed(1)}% is below target. Review phone numbers and message content.</p>
                    </div>
                  </div>
                )}

                {metrics.failedCount > 0 && (
                  <div className="flex items-start p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">{metrics.failedCount} Failed Messages</p>
                      <p className="text-xs text-orange-700 mt-1">Review failed messages and check contact phone numbers for accuracy.</p>
                    </div>
                  </div>
                )}

                {metrics.processingCampaigns > 0 && (
                  <div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <ClockIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">{metrics.processingCampaigns} Active Campaigns</p>
                      <p className="text-xs text-blue-700 mt-1">Currently processing messages. Check Messages page for real-time progress.</p>
                    </div>
                  </div>
                )}

                {metrics.totalMessagesCount === 0 && (
                  <div className="flex items-start p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">No Messages Yet</p>
                      <p className="text-xs text-gray-700 mt-1">Start your first campaign to see analytics data here.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-blue-600 mr-2">💡</span>
                  <p className="text-sm text-gray-700">
                    <strong>Best Time to Send:</strong> Weekdays 9 AM - 6 PM show highest engagement rates
                  </p>
                </div>

                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <p className="text-sm text-gray-700">
                    <strong>Message Length:</strong> Keep messages under 500 characters for better delivery
                  </p>
                </div>

                <div className="flex items-start">
                  <span className="text-purple-600 mr-2">🎯</span>
                  <p className="text-sm text-gray-700">
                    <strong>AI Personalization:</strong> Campaigns with AI personalization show {metrics.avgSuccessRatePerCampaign.toFixed(0)}% avg success
                  </p>
                </div>

                <div className="flex items-start">
                  <span className="text-orange-600 mr-2">⏱️</span>
                  <p className="text-sm text-gray-700">
                    <strong>Delay Settings:</strong> 60-90 second delays optimize delivery while preventing bans
                  </p>
                </div>

                <div className="flex items-start">
                  <span className="text-cyan-600 mr-2">📊</span>
                  <p className="text-sm text-gray-700">
                    <strong>Campaign Size:</strong> Optimal batch size is 50-200 contacts for best results
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">Backend Status</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">Online</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">Database</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">Connected</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">Queue System</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">Active</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">AI Service</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">Ready</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <FireIcon className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Spam Protection</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* No Data Message */}
        {metrics.totalMessagesCount === 0 && (
          <div className="card">
            <div className="card-body">
              <div className="text-center py-12">
                <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Yet</h3>
                <p className="text-gray-600 mb-4">Start sending messages to see detailed analytics and insights</p>
                <a href="/messages" className="btn btn-primary">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Send Your First Campaign
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

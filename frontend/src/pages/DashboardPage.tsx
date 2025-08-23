import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalDocuments: number;
  pendingSignatures: number;
  completedWorkflows: number;
  activeWorkflows: number;
  complianceScore: number;
  recentActivity: Array<{
    id: string;
    type: 'document_uploaded' | 'document_signed' | 'workflow_completed' | 'compliance_check';
    title: string;
    description: string;
    timestamp: string;
    documentId?: string;
    workflowId?: string;
  }>;
  recentDocuments: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    parties?: number;
    completionPercentage?: number;
  }>;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: { value: number; isPositive: boolean };
  onClick?: () => void;
}> = ({ title, value, icon: Icon, color, trend, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer ${onClick ? 'hover:shadow-md' : ''}`}
    onClick={onClick}
  >
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {trend && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </motion.div>
);

const ActivityItem: React.FC<{
  activity: DashboardStats['recentActivity'][0];
}> = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'document_uploaded':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'document_signed':
        return <PencilSquareIcon className="h-5 w-5 text-green-500" />;
      case 'workflow_completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'compliance_check':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
        <p className="text-sm text-gray-500">{activity.description}</p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
      {activity.documentId && (
        <Link
          to={`/documents/${activity.documentId}`}
          className="flex-shrink-0 text-primary-600 hover:text-primary-500"
        >
          <EyeIcon className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.analytics.getDashboardStats();
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading dashboard</h3>
        <p className="mt-1 text-sm text-gray-500">Please try refreshing the page.</p>
      </div>
    );
  }

  const quickActions = [
    {
      name: 'Upload Document',
      description: 'Upload a new document for signing',
      href: '/documents/upload',
      icon: PlusIcon,
      color: 'bg-primary-600 hover:bg-primary-700',
    },
    {
      name: 'View Documents',
      description: 'Manage your documents and workflows',
      href: '/documents',
      icon: DocumentTextIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Analytics',
      description: 'View detailed performance metrics',
      href: '/analytics',
      icon: ChartBarIcon,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'Settings',
      description: 'Configure your account settings',
      href: '/settings',
      icon: CogIcon,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}! 🇳🇦
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your digital signatures today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Documents"
          value={stats?.totalDocuments || 0}
          icon={DocumentTextIcon}
          color="text-blue-600"
          trend={{ value: 12, isPositive: true }}
          onClick={() => window.location.href = '/documents'}
        />
        <StatCard
          title="Pending Signatures"
          value={stats?.pendingSignatures || 0}
          icon={ClockIcon}
          color="text-yellow-600"
          trend={{ value: -8, isPositive: false }}
        />
        <StatCard
          title="Completed Workflows"
          value={stats?.completedWorkflows || 0}
          icon={CheckCircleIcon}
          color="text-green-600"
          trend={{ value: 24, isPositive: true }}
        />
        <StatCard
          title="Compliance Score"
          value={`${stats?.complianceScore || 0}%`}
          icon={ExclamationTriangleIcon}
          color="text-red-600"
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    to={action.href}
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className={`flex-shrink-0 p-2 rounded-md ${action.color}`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{action.name}</p>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Activity
                </h3>
                <Link
                  to="/analytics"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-1">
                {stats?.recentActivity?.length ? (
                  stats.recentActivity.slice(0, 6).map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2">No recent activity</p>
                    <p className="text-sm">Upload your first document to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Documents
            </h3>
            <Link
              to="/documents"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              View all documents
            </Link>
          </div>
          
          {stats?.recentDocuments?.length ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentDocuments.slice(0, 5).map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {document.title}
                            </div>
                            {document.parties && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <UsersIcon className="h-4 w-4 mr-1" />
                                {document.parties} parties
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          document.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : document.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {document.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {document.completionPercentage !== undefined ? (
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{ width: `${document.completionPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {document.completionPercentage}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(document.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/documents/${document.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading your first document.
              </p>
              <div className="mt-6">
                <Link
                  to="/documents/upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Upload Document
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
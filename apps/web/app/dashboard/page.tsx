'use client'

import { useState, useEffect } from 'react'
import { ProgressiveOnboarding } from '../../../../components/onboarding/ProgressiveOnboarding'
import { TrustIndicators } from '../../../../components/trust/TrustIndicators'

interface OnboardingTask {
  id: string
  title: string
  description?: string
  completed: boolean
}

export default function DashboardPage() {
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([
    {
      id: 'upload-document',
      title: 'Upload your first document',
      description: 'Start by uploading a document to sign',
      completed: false
    },
    {
      id: 'add-recipients',
      title: 'Add recipients',
      description: 'Invite people to sign your document',
      completed: false
    },
    {
      id: 'place-signatures',
      title: 'Place signature fields',
      description: 'Drag and drop signature fields on your document',
      completed: false
    },
    {
      id: 'send-document',
      title: 'Send for signing',
      description: 'Send your document to recipients for signing',
      completed: false
    }
  ])

  const handleToggleTask = (id: string, completed: boolean) => {
    setOnboardingTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, completed } : task
      )
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to BuffrSign - your digital signature platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-title">Documents</div>
              <div className="stat-value text-brand-blue-600">12</div>
              <div className="stat-desc">Total documents</div>
            </div>
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-title">Pending</div>
              <div className="stat-value text-warning">3</div>
              <div className="stat-desc">Awaiting signatures</div>
            </div>
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-title">Completed</div>
              <div className="stat-value text-success">9</div>
              <div className="stat-desc">Fully signed</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">Contract signed by John Doe</span>
                  <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span className="text-sm">NDA sent to Jane Smith</span>
                  <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-info rounded-full"></div>
                  <span className="text-sm">New document uploaded</span>
                  <span className="text-xs text-gray-500 ml-auto">2 days ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="/documents/new" className="btn btn-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Document
                </a>
                <a href="/templates" className="btn btn-outline">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Templates
                </a>
                <a href="/documents" className="btn btn-outline">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Documents
                </a>
                <a href="/account" className="btn btn-outline">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Account Settings
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Onboarding */}
          <ProgressiveOnboarding 
            tasks={onboardingTasks}
            onToggle={handleToggleTask}
          />

          {/* Trust Indicators */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="font-semibold mb-3">Security & Compliance</h3>
              <TrustIndicators />
            </div>
          </div>

          {/* System Status */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="font-semibold mb-3">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-xs text-success">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-xs text-success">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Services</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-xs text-success">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


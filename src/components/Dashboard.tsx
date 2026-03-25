'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiLogOut,
  FiUser,
  FiMail,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { MdAssignment } from 'react-icons/md';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { count } from 'console';

interface DashboardData {
  leads: Array<{ id: number; name: string; status: string; value: string }>;
  tasks: Array<{ id: number; title: string; dueDate: string; status: string }>;
  users: Array<{ id: number; name: string; email: string; role: string }>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function DashboardComponent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'leads' | 'tasks' | 'users'>('leads');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchDashboardData();
    } catch (err) {
      router.push('/login');
    }
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/data', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        localStorage.removeItem('user');
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    } finally {
      setShowLogoutDialog(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  if (!user) {
    return null;
  }

  const stats = [
    { label: 'Total Leads', value: dashboardData?.leads.length || 0, icon: FiTrendingUp, color: 'from-blue-500 to-cyan-500' },
    { label: 'Tasks', value: dashboardData?.tasks.length || 0, icon: MdAssignment, color: 'from-purple-500 to-pink-500' },
    { label: 'Team Members', value: dashboardData?.users.length || 0, icon: FiUsers, color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 opacity-5 rounded-full -ml-48 -mb-48"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                <FiUser className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-blue-100 text-sm">Welcome back, {user.name}!</p>
                <p className="text-blue-100 text-sm">{user.email}</p>
              </div>
            </div>
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <AlertDialogTrigger>
                <div
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur font-medium cursor-pointer"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to logout? You will be redirected to the login page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel variant="secondary" onClick={cancelLogout}>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={confirmLogout}>Logout</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3 backdrop-blur">
            <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-300">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div> */}

            {/* Data Tabs */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-white/10">
                <div className="flex overflow-x-auto px-4 sm:px-6">
                  {[
                    { id: 'leads', label: 'Leads', icon: FiTrendingUp,count: dashboardData?.leads.length || 0 },
                    { id: 'tasks', label: 'Tasks', icon: MdAssignment,count: dashboardData?.tasks.length || 0 },
                    { id: 'users', label: 'Team', icon: FiUsers,count: dashboardData?.users.length || 0 },
                  ].map(({ id, label, icon: Icon, count }) => (
                    <button
                      key={id}
                      onClick={() => {
                        setActiveTab(id as 'leads' | 'tasks' | 'users');
                        setMobileMenuOpen(false);
                      }}
                      className={`py-4 px-4 sm:px-6 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                        activeTab === id
                          ? 'border-blue-500 text-blue-400'
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label} ({count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {/* Leads Tab */}
                {activeTab === 'leads' && dashboardData && (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {dashboardData.leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-4 text-sm text-gray-300">{lead.name}</td>
                              <td className="px-4 py-4 text-sm">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    lead.status === 'Active'
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-yellow-500/20 text-yellow-400'
                                  }`}
                                >
                                  {lead.status}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm font-semibold text-white">{lead.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tasks Tab */}
                {activeTab === 'tasks' && dashboardData && (
                  <div>
                   
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Due Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {dashboardData.tasks.map((task) => (
                            <tr key={task.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-4 text-sm text-gray-300">{task.title}</td>
                              <td className="px-4 py-4 text-sm text-gray-400">{task.dueDate}</td>
                              <td className="px-4 py-4 text-sm">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    task.status === 'Completed'
                                      ? 'bg-green-500/20 text-green-400'
                                      : task.status === 'In Progress'
                                      ? 'bg-blue-500/20 text-blue-400'
                                      : 'bg-gray-500/20 text-gray-400'
                                  }`}
                                >
                                  {task.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && dashboardData && (
                  <div>
                  
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {dashboardData.users.map((u) => (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-4 text-sm text-gray-300">{u.name}</td>
                              <td className="px-4 py-4 text-sm text-gray-400 truncate">{u.email}</td>
                              <td className="px-4 py-4 text-sm">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                                  {u.role}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
     
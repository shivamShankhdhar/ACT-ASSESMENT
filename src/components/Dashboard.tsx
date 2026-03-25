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
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSave,
  FiX as FiClose,
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface DashboardData {
  leads: Array<{
    id: string;
    name: string;
    status: string;
    value: string;
    email?: string;
    phone?: string;
    company?: string;
    notes?: string;
    createdBy?: any;
    updatedBy?: any;
    createdAt?: string;
    updatedAt?: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate: string;
    assignedTo?: any;
    createdBy?: any;
    updatedBy?: any;
    createdAt?: string;
    updatedAt?: string;
  }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

// import * as z from 'zod';

const leadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  status: z.enum(['Active', 'Pending', 'Inactive']),
  value: z.string().min(1, 'Value is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled']),
  priority: z.enum(['Low', 'Medium', 'High']),
  dueDate: z.string().min(1, 'Due date is required'),
  assignedTo: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;
type TaskFormData = z.infer<typeof taskSchema>;

export default function DashboardComponent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'leads' | 'tasks' | 'users'>('leads');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteLeadDialog, setShowDeleteLeadDialog] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [showDeleteTaskDialog, setShowDeleteTaskDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Demo data
  const demoLeads = [
    {
      id: 'demo-lead-1',
      name: 'John Smith',
      status: 'Active',
      value: '50000',
      email: 'john.smith@example.com',
      phone: '+1-555-0123',
      company: 'TechCorp Inc.',
      notes: 'Interested in our premium package',
      createdBy: { name: 'Demo User', email: 'demo@example.com' },
      updatedBy: { name: 'Demo User', email: 'demo@example.com' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-lead-2',
      name: 'Sarah Johnson',
      status: 'Pending',
      value: '75000',
      email: 'sarah.johnson@example.com',
      phone: '+1-555-0456',
      company: 'StartupXYZ',
      notes: 'Follow up next week',
      createdBy: { name: 'Demo User', email: 'demo@example.com' },
      updatedBy: { name: 'Demo User', email: 'demo@example.com' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-lead-3',
      name: 'Mike Davis',
      status: 'Active',
      value: '30000',
      email: 'mike.davis@example.com',
      phone: '+1-555-0789',
      company: 'Local Business LLC',
      notes: 'Needs custom solution',
      createdBy: { name: 'Demo User', email: 'demo@example.com' },
      updatedBy: { name: 'Demo User', email: 'demo@example.com' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const demoTasks = [
    {
      id: 'demo-task-1',
      title: 'Follow up with John Smith',
      description: 'Call John to discuss the premium package details',
      status: 'Pending',
      priority: 'High',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
      assignedTo: { name: 'Demo User', email: 'demo@example.com' },
      createdBy: { name: 'Demo User', email: 'demo@example.com' },
      updatedBy: { name: 'Demo User', email: 'demo@example.com' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-task-2',
      title: 'Prepare proposal for Sarah Johnson',
      description: 'Create detailed proposal for StartupXYZ project',
      status: 'In Progress',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
      assignedTo: { name: 'Demo User', email: 'demo@example.com' },
      createdBy: { name: 'Demo User', email: 'demo@example.com' },
      updatedBy: { name: 'Demo User', email: 'demo@example.com' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-task-3',
      title: 'Schedule meeting with Mike Davis',
      description: 'Set up a meeting to discuss custom solution requirements',
      status: 'Pending',
      priority: 'Low',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      assignedTo: { name: 'Demo User', email: 'demo@example.com' },
      createdBy: { name: 'Demo User', email: 'demo@example.com' },
      updatedBy: { name: 'Demo User', email: 'demo@example.com' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // CRUD state
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form hooks
  const leadForm = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      status: 'Pending',
      value: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
    },
  });

  const taskForm = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'Pending',
      priority: 'Medium',
      dueDate: '',
      assignedTo: '',
    },
  });

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
    const startTime = Date.now();
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
      // Ensure minimum loading time of 1 second for better UX
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
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

  // CRUD Functions
  const openLeadModal = (lead?: any) => {
    if (lead) {
      setEditingLead(lead);
      leadForm.reset({
        name: lead.name || '',
        status: lead.status || 'Pending',
        value: lead.value?.toString() || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        notes: lead.notes || '',
      });
    } else {
      setEditingLead(null);
      leadForm.reset({
        name: '',
        status: 'Pending',
        value: '',
        email: '',
        phone: '',
        company: '',
        notes: '',
      });
    }
    setShowLeadModal(true);
  };

  const openTaskModal = (task?: any) => {
    if (task) {
      setEditingTask(task);
      taskForm.reset({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'Pending',
        priority: task.priority || 'Medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assignedTo: task.assignedTo || '',
      });
    } else {
      setEditingTask(null);
      taskForm.reset({
        title: '',
        description: '',
        status: 'Pending',
        priority: 'Medium',
        dueDate: '',
        assignedTo: '',
      });
    }
    setShowTaskModal(true);
  };

  const closeLeadModal = () => {
    setShowLeadModal(false);
    setEditingLead(null);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const saveLead = async (data: LeadFormData) => {
    setSaving(true);
    try {
      if (isDemoMode) {
        // Handle demo mode - update local data
        if (editingLead) {
          // Update existing demo lead
          const updatedLeads = dashboardData!.leads.map(lead =>
            lead.id === editingLead.id
              ? {
                  ...lead,
                  ...data,
                  value: data.value.toString(),
                  updatedAt: new Date().toISOString(),
                }
              : lead
          );
          setDashboardData({
            ...dashboardData!,
            leads: updatedLeads,
          });
        } else {
          // Add new demo lead
          const newLead = {
            id: `demo-lead-${Date.now()}`,
            ...data,
            value: data.value.toString(),
            status: data.status as 'Active' | 'Pending',
            createdBy: { name: 'Demo User', email: 'demo@example.com' },
            updatedBy: { name: 'Demo User', email: 'demo@example.com' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setDashboardData({
            ...dashboardData!,
            leads: [...dashboardData!.leads, newLead],
          });
        }
        closeLeadModal();
        return;
      }

      // Normal API mode
      const method = editingLead ? 'PUT' : 'POST';
      const url = editingLead ? `/api/leads/${editingLead.id}` : '/api/leads';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save lead');
      }

      await fetchDashboardData();
      closeLeadModal();
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to save lead');
    } finally {
      setSaving(false);
    }
  };

  const saveTask = async (data: TaskFormData) => {
    setSaving(true);
    try {
      if (isDemoMode) {
        // Handle demo mode - update local data
        if (editingTask) {
          // Update existing demo task
          const updatedTasks = dashboardData!.tasks.map(task =>
            task.id === editingTask.id
              ? {
                  ...task,
                  ...data,
                  dueDate: data.dueDate,
                  updatedAt: new Date().toISOString(),
                }
              : task
          );
          setDashboardData({
            ...dashboardData!,
            tasks: updatedTasks,
          });
        } else {
          // Add new demo task
          const newTask = {
            id: `demo-task-${Date.now()}`,
            ...data,
            dueDate: data.dueDate,
            status: data.status as 'Pending' | 'In Progress' | 'Completed',
            priority: data.priority as 'Low' | 'Medium' | 'High',
            createdBy: { name: 'Demo User', email: 'demo@example.com' },
            updatedBy: { name: 'Demo User', email: 'demo@example.com' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setDashboardData({
            ...dashboardData!,
            tasks: [...dashboardData!.tasks, newTask],
          });
        }
        closeTaskModal();
        return;
      }

      // Normal API mode
      const method = editingTask ? 'PUT' : 'POST';
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save task');
      }

      await fetchDashboardData();
      closeTaskModal();
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const deleteLead = async (id: string) => {
    setLeadToDelete(id);
    setShowDeleteLeadDialog(true);
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;

    try {
      if (isDemoMode) {
        // Handle demo mode - update local data
        const updatedLeads = dashboardData!.leads.filter(lead => lead.id !== leadToDelete);
        setDashboardData({
          ...dashboardData!,
          leads: updatedLeads,
        });
        setShowDeleteLeadDialog(false);
        setLeadToDelete(null);
        return;
      }

      // Normal API mode
      const response = await fetch(`/api/leads/${leadToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }

      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete lead');
    } finally {
      setShowDeleteLeadDialog(false);
      setLeadToDelete(null);
    }
  };

  const cancelDeleteLead = () => {
    setShowDeleteLeadDialog(false);
    setLeadToDelete(null);
  };

  const deleteTask = async (id: string) => {
    setTaskToDelete(id);
    setShowDeleteTaskDialog(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      if (isDemoMode) {
        // Handle demo mode - update local data
        const updatedTasks = dashboardData!.tasks.filter(task => task.id !== taskToDelete);
        setDashboardData({
          ...dashboardData!,
          tasks: updatedTasks,
        });
        setShowDeleteTaskDialog(false);
        setTaskToDelete(null);
        return;
      }

      // Normal API mode
      const response = await fetch(`/api/tasks/${taskToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    } finally {
      setShowDeleteTaskDialog(false);
      setTaskToDelete(null);
    }
  };

  const cancelDeleteTask = () => {
    setShowDeleteTaskDialog(false);
    setTaskToDelete(null);
  };

  const loadDemoData = () => {
    setIsDemoMode(true);
    setDashboardData({
      leads: demoLeads,
      tasks: demoTasks,
      users: dashboardData?.users || [],
    });
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    fetchDashboardData();
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
                {isDemoMode && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 border border-purple-500/50 rounded-full text-purple-200 text-xs font-medium">
                    <FiTrendingUp className="w-3 h-3" />
                    Demo Mode Active
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isDemoMode && (
                <button
                  onClick={exitDemoMode}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-sm"
                >
                  <FiX className="w-4 h-4" />
                  Exit Demo
                </button>
              )}
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
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl overflow-hidden">
            {/* Tab Navigation Skeleton */}
            <div className="border-b border-white/10">
              <div className="flex overflow-x-auto px-4 sm:px-6">
                {[
                  { label: 'Leads', icon: FiTrendingUp },
                  { label: 'Tasks', icon: MdAssignment },
                  { label: 'Team', icon: FiUsers },
                ].map(({ label, icon: Icon }, index) => (
                  <div key={index} className="py-4 px-4 sm:px-6 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{label}</span>
                    <Skeleton className="w-6 h-4" />
                  </div>
                ))}
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="p-4 sm:p-6">
              {/* Header Skeleton */}
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="w-48 h-8" />
                <Skeleton className="w-32 h-10" />
              </div>

              {/* Table Skeleton */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <Skeleton className="w-16 h-4" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <Skeleton className="w-16 h-4" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <Skeleton className="w-16 h-4" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <Skeleton className="w-12 h-4" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 text-sm">
                          <Skeleton className="w-32 h-4" />
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <Skeleton className="w-20 h-6 rounded-full" />
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <Skeleton className="w-24 h-4" />
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-8 h-8 rounded" />
                            <Skeleton className="w-8 h-8 rounded" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-white">Leads Management</h3>
                      <button
                        onClick={() => openLeadModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                      >
                        <FiPlus className="w-4 h-4" />
                        Add Lead
                      </button>
                    </div>
                    {dashboardData.leads.length === 0 ? (
                      <div className="text-center py-20">
                        <FiTrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Leads Yet</h3>
                        <p className="text-gray-400 mb-6">Get started by adding your first lead to track your sales pipeline.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <button
                            onClick={() => openLeadModal()}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                          >
                            <FiPlus className="w-4 h-4" />
                            Add Your First Lead
                          </button>
                          <button
                            onClick={loadDemoData}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                          >
                            <FiTrendingUp className="w-4 h-4" />
                            Load Demo Data
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Value</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
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
                                <td className="px-4 py-4 text-sm font-semibold text-white">₹{lead.value.replace(/^\$/, '')}</td>
                                <td className="px-4 py-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => openLeadModal(lead)}
                                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                                      title="Edit lead"
                                    >
                                      <FiEdit className="w-4 h-4" />
                                    </button>
                                    {!isDemoMode && (
                                      <AlertDialog open={showDeleteLeadDialog} onOpenChange={setShowDeleteLeadDialog}>
                                        <AlertDialogTrigger>
                                          <div
                                            onClick={() => deleteLead(lead.id)}
                                            className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                            title="Delete lead"
                                          >
                                            <FiTrash2 className="w-4 h-4" />
                                          </div>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete this lead? This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel variant="secondary" onClick={cancelDeleteLead}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction variant="destructive" onClick={confirmDeleteLead}>
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Tasks Tab */}
                {activeTab === 'tasks' && dashboardData && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-white">Task Management</h3>
                      <button
                        onClick={() => openTaskModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                      >
                        <FiPlus className="w-4 h-4" />
                        Add Task
                      </button>
                    </div>
                    {dashboardData.tasks.length === 0 ? (
                      <div className="text-center py-20">
                        <MdAssignment className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Tasks Yet</h3>
                        <p className="text-gray-400 mb-6">Create and assign tasks to keep your team organized and productive.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <button
                            onClick={() => openTaskModal()}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                          >
                            <FiPlus className="w-4 h-4" />
                            Add Your First Task
                          </button>
                          <button
                            onClick={loadDemoData}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                          >
                            <MdAssignment className="w-4 h-4" />
                            Load Demo Data
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Due Date</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
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
                                <td className="px-4 py-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => openTaskModal(task)}
                                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                                      title="Edit task"
                                    >
                                      <FiEdit className="w-4 h-4" />
                                    </button>
                                    {!isDemoMode && (
                                      <AlertDialog open={showDeleteTaskDialog} onOpenChange={setShowDeleteTaskDialog}>
                                        <AlertDialogTrigger>
                                          <div
                                            onClick={() => deleteTask(task.id)}
                                            className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                            title="Delete task"
                                          >
                                            <FiTrash2 className="w-4 h-4" />
                                          </div>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete this task? This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel variant="secondary" onClick={cancelDeleteTask}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction variant="destructive" onClick={confirmDeleteTask}>
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && dashboardData && (
                  <div>
                    {dashboardData.users.length === 0 ? (
                      <div className="text-center py-20">
                        <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Team Members Yet</h3>
                        <p className="text-gray-400 mb-6">Invite team members to collaborate on leads and tasks.</p>
                        <button
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                        >
                          <FiPlus className="w-4 h-4" />
                          Invite Team Members
                        </button>
                      </div>
                    ) : (
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
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
              </h3>
              <button
                onClick={closeLeadModal}
                className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <FiClose className="w-5 h-5" />
              </button>
            </div>

            <FormProvider {...leadForm}>
              <form onSubmit={leadForm.handleSubmit(saveLead)} className="space-y-4">
                <div>
                  <Label htmlFor="lead-name">Name *</Label>
                  <Input
                    id="lead-name"
                    {...leadForm.register('name')}
                    placeholder="Lead name"
                  />
                  {leadForm.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">{leadForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lead-status">Status</Label>
                  <select
                    id="lead-status"
                    {...leadForm.register('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="lead-value">Value *</Label>
                  <Input
                    id="lead-value"
                    {...leadForm.register('value')}
                    placeholder="₹50,000"
                  />
                  {leadForm.formState.errors.value && (
                    <p className="text-sm text-red-600 mt-1">{leadForm.formState.errors.value.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lead-email">Email</Label>
                  <Input
                    id="lead-email"
                    type="email"
                    {...leadForm.register('email')}
                    placeholder="lead@example.com"
                  />
                  {leadForm.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">{leadForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lead-phone">Phone</Label>
                  <Input
                    id="lead-phone"
                    type="tel"
                    {...leadForm.register('phone')}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <Label htmlFor="lead-company">Company</Label>
                  <Input
                    id="lead-company"
                    {...leadForm.register('company')}
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <Label htmlFor="lead-notes">Notes</Label>
                  <textarea
                    id="lead-notes"
                    {...leadForm.register('notes')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={closeLeadModal}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : (editingLead ? 'Update Lead' : 'Add Lead')}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button
                onClick={closeTaskModal}
                className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <FiClose className="w-5 h-5" />
              </button>
            </div>

            <FormProvider {...taskForm}>
              <form onSubmit={taskForm.handleSubmit(saveTask)} className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Title *</Label>
                  <Input
                    id="task-title"
                    {...taskForm.register('title')}
                    placeholder="Task title"
                  />
                  {taskForm.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1">{taskForm.formState.errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="task-description">Description</Label>
                  <textarea
                    id="task-description"
                    {...taskForm.register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Task description..."
                  />
                </div>

                <div>
                  <Label htmlFor="task-status">Status</Label>
                  <select
                    id="task-status"
                    {...taskForm.register('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="task-priority">Priority</Label>
                  <select
                    id="task-priority"
                    {...taskForm.register('priority')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="task-dueDate">Due Date *</Label>
                  <Input
                    id="task-dueDate"
                    type="date"
                    {...taskForm.register('dueDate')}
                  />
                  {taskForm.formState.errors.dueDate && (
                    <p className="text-sm text-red-600 mt-1">{taskForm.formState.errors.dueDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="task-assignedTo">Assign To</Label>
                  <select
                    id="task-assignedTo"
                    {...taskForm.register('assignedTo')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Unassigned</option>
                    {dashboardData?.users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={closeTaskModal}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : (editingTask ? 'Update Task' : 'Add Task')}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      )}
    </div>
  );
}
     
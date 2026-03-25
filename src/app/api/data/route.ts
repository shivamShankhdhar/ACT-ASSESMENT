import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Task from '@/models/Task';
import User from '@/models/User';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    await jwtVerify(token, secret);

    // Fetch real data from database
    const [leads, tasks, users] = await Promise.all([
      Lead.find({})
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ createdAt: -1 }),
      Task.find({})
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 }),
      User.find({}, 'name email createdAt').sort({ createdAt: -1 }),
    ]);

    // Transform data to match frontend expectations
    const dashboardData = {
      leads: leads.map(lead => ({
        id: lead._id.toString(),
        name: lead.name,
        status: lead.status,
        value: lead.value,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        notes: lead.notes,
        createdBy: lead.createdBy,
        updatedBy: lead.updatedBy,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      })),
      tasks: tasks.map(task => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        assignedTo: task.assignedTo,
        createdBy: task.createdBy,
        updatedBy: task.updatedBy,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
      users: users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: 'User', // Default role since we don't have roles in User model yet
        createdAt: user.createdAt,
      })),
    };

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error: any) {
    console.error('Data fetch error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

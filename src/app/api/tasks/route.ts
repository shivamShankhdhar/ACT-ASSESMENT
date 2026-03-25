import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/models/User';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    throw new Error('Unauthorized');
  }

  const { payload } = await jwtVerify(token, secret);
  const user = await User.findById(payload.userId);
  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

// GET /api/tasks - Get all tasks
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getUserFromToken(request);

    const tasks = await Task.find({})
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error: any) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getUserFromToken(request);

    const { title, description, status, priority, dueDate, assignedTo } = await request.json();

    // Validate required fields
    if (!title || !dueDate) {
      return NextResponse.json(
        { error: 'Title and due date are required' },
        { status: 400 }
      );
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'Pending',
      priority: priority || 'Medium',
      dueDate: new Date(dueDate),
      assignedTo,
      createdBy: user._id,
      updatedBy: user._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('assignedTo', 'name email');

    return NextResponse.json(populatedTask, { status: 201 });
  } catch (error: any) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}
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

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    await getUserFromToken(request);
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const task = await Task.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error: any) {
    console.error('Get task error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const user = await getUserFromToken(request);
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const { title, description, status, priority, dueDate, assignedTo } = await request.json();

    const task = await Task.findByIdAndUpdate(
      id,
      {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedTo: assignedTo || undefined,
        updatedBy: user._id,
      },
      { returnDocument: 'after', runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error: any) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    await getUserFromToken(request);
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}
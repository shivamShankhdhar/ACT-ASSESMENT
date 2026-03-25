import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
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

// GET /api/leads/[id] - Get a specific lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    await getUserFromToken(request);
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const lead = await Lead.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lead, { status: 200 });
  } catch (error: any) {
    console.error('Get lead error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

// PUT /api/leads/[id] - Update a lead
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const user = await getUserFromToken(request);
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const { name, status, value, email, phone, company, notes } = await request.json();

    const lead = await Lead.findByIdAndUpdate(
      id,
      {
        name,
        status,
        value,
        email,
        phone,
        company,
        notes,
        updatedBy: user._id,
      },
      { returnDocument: 'after', runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lead, { status: 200 });
  } catch (error: any) {
    console.error('Update lead error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update lead' },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/[id] - Delete a lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    await getUserFromToken(request);
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Lead deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete lead error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
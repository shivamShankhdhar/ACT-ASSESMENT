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

// GET /api/leads - Get all leads
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getUserFromToken(request);

    const leads = await Lead.find({})
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(leads, { status: 200 });
  } catch (error: any) {
    console.error('Get leads error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getUserFromToken(request);

    const { name, status, value, email, phone, company, notes } = await request.json();

    // Validate required fields
    if (!name || !value) {
      return NextResponse.json(
        { error: 'Name and value are required' },
        { status: 400 }
      );
    }

    const lead = await Lead.create({
      name,
      status: status || 'Pending',
      value,
      email,
      phone,
      company,
      notes,
      createdBy: user._id,
      updatedBy: user._id,
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    return NextResponse.json(populatedLead, { status: 201 });
  } catch (error: any) {
    console.error('Create lead error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create lead' },
      { status: 500 }
    );
  }
}
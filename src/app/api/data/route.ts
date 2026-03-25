import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    await jwtVerify(token, secret);

    // Return mock data
    const dashboardData = {
      leads: [
        { id: 1, name: 'Acme Corp', status: 'Active', value: '$50,000' },
        { id: 2, name: 'Tech Solutions', status: 'Pending', value: '$30,000' },
        { id: 3, name: 'Global Industries', status: 'Active', value: '$75,000' },
      ],
      tasks: [
        { id: 1, title: 'Follow up with client', dueDate: '2026-03-30', status: 'Pending' },
        { id: 2, title: 'Prepare presentation', dueDate: '2026-03-27', status: 'In Progress' },
        { id: 3, title: 'Review proposal', dueDate: '2026-03-26', status: 'Completed' },
      ],
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
      ],
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

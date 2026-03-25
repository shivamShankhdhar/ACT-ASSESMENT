# Full Stack Web Application

A modern full-stack web application built with Next.js, featuring user authentication, a dashboard with data management, and a clean, responsive UI.

## Features

✨ **Core Features**
- User Authentication (Login & Registration)
- Secure JWT-based authentication
- Password hashing with bcryptjs
- Protected routes and dashboard
- User session management
- Logout functionality

📊 **Dashboard Features**
- Display logged-in user information
- View and manage leads (demo data)
- View and manage tasks (demo data)
- View and manage users (demo data)
- Tab-based navigation for data categories
- Loading states and error handling
- Responsive design

🔒 **Security Features**
- Password validation
- Email format validation
- Secure token storage in HTTP-only cookies
- Protected API endpoints
- Environment variable configuration

## Tech Stack

### Frontend
- **Next.js 16.2.1** - React-based framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management (useState, useEffect)
- **Next.js Navigation** - Client-side routing

### Backend
- **Next.js API Routes** - Serverless backend
- **Node.js** - JavaScript runtime
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **jose** - JWT verification in Edge Runtime

### Development Tools
- **npm** - Package manager
- **ESLint** - Code linting
- **TypeScript** - Type checking

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── logout/route.ts
│   │   └── data/route.ts
│   ├── dashboard/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── page.tsx
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── Dashboard.tsx
├── lib/
│   └── mongodb.ts
├── models/
│   └── User.ts
└── styles/
    └── globals.css
```

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB Atlas account with database connection string

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd fullstack-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root with the following variables:


**Important:** Replace the MongoDB URI and JWT_SECRET with your actual values.

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication Endpoints

#### Register
- **Endpoint:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "userId",
      "email": "john@example.com",
      "name": "John Doe"
    }
  }
  ```

#### Login
- **Endpoint:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "userId",
      "email": "john@example.com",
      "name": "John Doe"
    }
  }
  ```

#### Logout
- **Endpoint:** `POST /api/auth/logout`
- **Response:**
  ```json
  {
    "message": "Logout successful"
  }
  ```

### Data Endpoints

#### Get Dashboard Data
- **Endpoint:** `GET /api/data`
- **Headers:** Requires valid JWT token in cookies
- **Response:**
  ```json
  {
    "leads": [
      {
        "id": 1,
        "name": "Acme Corp",
        "status": "Active",
        "value": "$50,000"
      }
    ],
    "tasks": [
      {
        "id": 1,
        "title": "Follow up with client",
        "dueDate": "2026-03-30",
        "status": "Pending"
      }
    ],
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "Admin"
      }
    ]
  }
  ```

## User Flows

### Registration Flow
1. User navigates to `/register`
2. Fills in name, email, password, and confirm password
3. Form validation checks:
   - All fields are required
   - Valid email format
   - Password minimum 6 characters
   - Passwords match
4. User registration creates encrypted password in database
5. User is automatically logged in and redirected to dashboard

### Login Flow
1. User navigates to `/login`
2. Enters email and password
3. Form validation checks:
   - Valid email format
   - Password not empty
4. Credentials verified against database
5. JWT token generated and stored in HTTP-only cookie
6. User redirected to dashboard

### Dashboard Flow
1. User accesses `/dashboard`
2. System checks for valid authentication token
3. If not authenticated, redirects to `/login`
4. Dashboard displays:
   - User profile information
   - Tabbed interface for leads, tasks, and users
   - Logout button
5. User can navigate between data categories
6. User can logout, clearing session and returning to login page

## Validation Rules

### Email Validation
- Must be in valid email format (e.g., user@example.com)
- Must be unique in the database (for registration)

### Password Validation
- Minimum 6 characters
- Cannot be empty
- Passwords must match (during registration)

## Error Handling

The application includes comprehensive error handling for:
- Invalid credentials
- Missing required fields
- Network errors
- Database connection issues
- Token expiration
- Unauthorized access attempts

Error messages are displayed to users in a user-friendly format with visual indicators.

## Loading States

- Loading indicator displayed while fetching dashboard data
- Submit button disabled while processing login/registration
- Smooth transitions between loading and loaded states

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

Tailwind CSS breakpoints are used for responsive layouts.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables
5. Deploy

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

1. Build the project:
   ```bash
   npm run build
   ```
2. Go to [netlify.com](https://netlify.com)
3. Drag and drop the `.next` folder
4. Add environment variables to Netlify dashboard

## Security Considerations

- JWT tokens stored in HTTP-only cookies
- Passwords hashed with bcryptjs before storage
- Environment variables for sensitive data
- Input validation on frontend and backend
- CORS properly configured for production

## Future Enhancement Ideas

- Add profile update functionality
- Implement CRUD operations for dashboard data
- Add user roles and permissions
- Email verification for registration
- Password reset functionality
- Two-factor authentication
- Real-time data updates with WebSockets
- File upload for user avatars
- Advanced search and filtering
- Data pagination
- Export data to CSV/PDF
- Email notifications

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure MongoDB Atlas cluster is running

### Authentication Issues
- Clear browser cookies
- Check JWT_SECRET is set correctly
- Verify token is being sent in requests

### Build Errors
- Clear `.next` folder
- Reinstall dependencies: `npm install`
- Check Node.js version compatibility

## Testing the Application

### Test Credentials

You can register a new account or use these test credentials:
- **Email:** test@example.com
- **Password:** password123
- **Name:** Test User

## Performance Optimizations

- Server-side rendering with Next.js
- Image optimization with Next.js Image component
- CSS-in-JS with Tailwind for minimal bundle size
- Static page generation where possible
- API route caching strategies

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue in the GitHub repository.

## Changelog

### Version 1.0.0 (Initial Release)
- User authentication (login & registration)
- Secure JWT-based authentication
- Dashboard with data display
- Logout functionality
- Responsive UI with Tailwind CSS
- Error handling and validation

---

**Happy coding!** 🚀

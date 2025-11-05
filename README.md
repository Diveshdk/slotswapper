# SlotSwapper - Peer-to-Peer Time Slot Scheduling

A modern, full-stack web application for peer-to-peer time slot scheduling and swapping, built with Next.js 16 and Supabase.

## 🚀 Live Demo

- **Live Demo**: [Your deployed application URL here]
- **API Documentation**: Test endpoints using curl or your preferred API client

## 📋 Project Overview

SlotSwapper is a comprehensive scheduling platform that allows users to:
- **Create and manage time slots** with different statuses (BUSY, SWAPPABLE, SWAP_PENDING)
- **Browse available slots** from other users in a marketplace
- **Send swap requests** to exchange time slots
- **Accept or reject incoming requests** with real-time updates
- **Track request history** with detailed status information

### 🎯 Key Design Choices

1. **Next.js 16 with App Router**: Modern React framework with server-side rendering and API routes
2. **Supabase**: PostgreSQL database with built-in authentication and real-time capabilities
3. **Row Level Security (RLS)**: Database-level security ensuring users can only access their own data
4. **Atomic Transactions**: Database functions ensure data consistency during swap operations
5. **Type-Safe APIs**: TypeScript throughout for better development experience
6. **Modern UI**: Tailwind CSS with Radix UI components for professional appearance

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: React Hooks, Supabase Real-time
- **Testing**: Jest (configured)

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm/pnpm
- A Supabase account and project

### 1. Clone the Repository

```bash
git clone [your-repository-url]
cd slotswapper
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database URLs (from Supabase Dashboard)
SUPABASE_POSTGRES_URL=your_postgres_connection_string
SUPABASE_POSTGRES_USER=postgres
SUPABASE_POSTGRES_HOST=your_supabase_host
SUPABASE_JWT_SECRET=your_jwt_secret
SUPABASE_POSTGRES_PRISMA_URL=your_prisma_connection_string
SUPABASE_POSTGRES_PASSWORD=your_db_password
SUPABASE_POSTGRES_DATABASE=postgres
SUPABASE_POSTGRES_URL_NON_POOLING=your_non_pooling_connection_string
```

### 4. Database Setup

Run the following SQL scripts in your Supabase SQL Editor (in order):

1. **Create Tables** (`/scripts/001_create_tables.sql`)
2. **Fix RLS Policies** (`/scripts/002_fix_rls_policies.sql`)
3. **Create Swap Functions** (`/scripts/003_create_swap_functions.sql`)

### 5. Start Development Server

```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## 🔗 API Endpoints

### Authentication Required
All API endpoints require authentication via Supabase JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Core Swap API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/api/swappable-slots` | Returns all swappable slots from other users | None |
| `POST` | `/api/swap-request` | Create a new swap request | `{ mySlotId: string, theirSlotId: string }` |
| `POST` | `/api/swap-response/[requestId]` | Accept or reject a swap request | `{ accepted: boolean }` |
| `GET` | `/api/swap-requests` | List user's incoming and outgoing requests | None |

### Additional Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/test` | Test API connection and user authentication |
| `GET` | `/api/health` | Health check endpoint |

### Example Requests

**Create Swap Request:**
```bash
curl -X POST http://localhost:3000/api/swap-request \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mySlotId": "uuid1", "theirSlotId": "uuid2"}'
```

**Accept Swap Request:**
```bash
curl -X POST http://localhost:3000/api/swap-response/request-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accepted": true}'
```

## 🧪 Testing the API

### Manual Testing
1. **Login** at `http://localhost:3000/auth/login`
2. **Create Events** in the dashboard and mark some as 'SWAPPABLE'
3. **Test Endpoints** using the browser dev tools or curl commands

## 🗄️ Database Schema

### Core Tables

- **`profiles`**: User profile information
- **`events`**: Time slots with status (BUSY, SWAPPABLE, SWAP_PENDING)
- **`swap_requests`**: Swap requests with status (PENDING, ACCEPTED, REJECTED)

### Key Database Functions

- **`accept_swap_request()`**: Atomically handles swap acceptance and ownership transfer
- **`reject_swap_request()`**: Atomically handles swap rejection and status reversion

## 🚦 Status Flow

```
SWAPPABLE → SWAP_PENDING → BUSY (accepted) or SWAPPABLE (rejected)
```

## 🔐 Security Features

- **Row Level Security (RLS)** on all database tables
- **JWT Authentication** for all API endpoints
- **Server-side validation** of swap operations
- **Atomic database transactions** for data consistency
- **SECURITY DEFINER** functions for elevated database operations

## 📱 Features

### ✅ Implemented Features

- **User Authentication** (Supabase Auth)
- **Event Management** (Create, Read, Update, Delete)
- **Marketplace** (Browse swappable slots from other users)
- **Swap Requests** (Send, receive, accept, reject)
- **Request History** (Track all swap activities)
- **Real-time Updates** (Status changes reflect immediately)
- **Responsive Design** (Mobile-friendly interface)

### 🎨 UI/UX Features

- **Dark/Light Theme Support**
- **Mobile-responsive Sidebar**
- **Interactive API Testing Page**
- **Status Badges and Visual Feedback**
- **Clean, Modern Design**

## 🚧 Assumptions Made

1. **Single User Sessions**: Users don't need concurrent sessions
2. **Time Slot Validation**: Frontend handles time conflict validation
3. **Email Verification**: Using Supabase's built-in email confirmation
4. **Timezone Handling**: Times stored in UTC, displayed in user's local timezone
5. **Slot Ownership**: Only slot owners can initiate swaps with their slots

## 💡 Challenges Faced & Solutions

### 1. **Database Relationships**
- **Challenge**: Complex foreign key relationships for joins
- **Solution**: Simplified queries and used direct references

### 2. **Atomic Swap Operations**
- **Challenge**: Ensuring data consistency during ownership transfers
- **Solution**: Created PostgreSQL functions with SECURITY DEFINER

### 3. **Real-time Updates**
- **Challenge**: Keeping UI in sync with database changes
- **Solution**: Supabase real-time subscriptions and optimistic updates

### 4. **Authentication Flow**
- **Challenge**: Managing auth state across API routes
- **Solution**: Supabase server client with cookie-based sessions

### 5. **Type Safety**
- **Challenge**: Maintaining type safety across API boundaries
- **Solution**: TypeScript interfaces and proper error handling

## 🏗️ Project Structure

```
slotswapper/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── marketplace/       # Slot marketplace
│   └── requests/          # Swap requests management
├── components/            # Reusable UI components
├── lib/                   # Utilities and services
├── scripts/               # Database setup scripts
├── hooks/                 # Custom React hooks
└── public/                # Static assets
```

## 🚀 Deployment

### Environment Variables
Ensure all environment variables are set in your deployment platform.

### Build Commands
```bash
npm run build
npm start
```

### Database
Run the provided SQL scripts in your Supabase project.

## 📝 Additional Documentation

- **API Documentation**: Complete details in `/SWAP_API_DOCUMENTATION.md`
- **Firebase Cleanup**: See `/FIREBASE_CLEANUP_SUMMARY.md`
- **UI Changes**: See `/UI_COLOR_FIX_SUMMARY.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or issues, please contact [your-email] or create an issue in the repository.

---

**Built with ❤️ using Next.js and Supabase**

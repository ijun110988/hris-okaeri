# HRIS Okaeri - Attendance Management System

A comprehensive employee attendance management system with QR code-based check-in functionality and leave request management.

## Features

- QR Code-based attendance system
- Mobile-friendly employee interface
- Role-based access control
- Leave request management
- Real-time attendance tracking
- Branch management

## Technology Stack

### Backend
- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JWT Authentication
- bcrypt for password hashing

### Frontend
- Next.js
- Tailwind CSS
- DaisyUI
- Axios
- HTML5 QR Code Scanner

## Project Structure

```
hris-okaeri/
├── backend/             # Backend API server
│   ├── src/
│   │   ├── config/     # Configuration files
│   │   ├── models/     # Database models
│   │   └── index.js    # Server entry point
│   └── .env            # Environment variables
│
└── mobile/             # Frontend mobile application
    ├── src/
    │   ├── pages/      # Next.js pages
    │   ├── components/ # React components
    │   └── styles/     # CSS styles
    └── package.json
```

## Database Models

### Users
- id (Primary Key)
- username (unique)
- password (hashed)
- nik (unique, for employees)
- name
- role (super_admin, admin, employee)
- isActive
- branchId (Foreign Key)

### Branches
- id (Primary Key)
- name
- code (unique)
- address
- isActive

### Attendances
- id (Primary Key)
- userId (Foreign Key)
- branchId (Foreign Key)
- checkInTime
- checkOutTime
- status (present, late, absent)
- qrToken

### LeaveRequests
- id (Primary Key)
- userId (Foreign Key)
- type (sick, vacation, personal)
- startDate
- endDate
- reason
- status (pending, approved, rejected)
- approvedBy (Foreign Key)
- approvedAt

### QRCodes
- id (Primary Key)
- token (unique)
- branchId (Foreign Key)
- expiresAt
- isUsed
- usedBy (Foreign Key)
- usedAt

## Initial Data

The system comes with pre-configured users for testing:

### Super Admin
- Username: superadmin
- Password: admin123
- Role: super_admin

### Admin
- Username: admin
- Password: admin123
- Role: admin

### Sample Employee
- Username: employee
- Password: admin123
- NIK: EMP001
- Role: employee

## Setup Instructions

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
Create a .env file in the backend directory with the following content:
```env
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=127.0.0.1
DB_USER=root
DB_PORT=8889
DB_PASSWORD=123456
DB_NAME=hris_okaeri

# JWT Configuration
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=24h

# QR Code Configuration
QR_EXPIRY_TIME=60000 # 1 minute in milliseconds
```

3. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Backend API: http://localhost:3001
- Frontend: http://localhost:3002

## API Endpoints

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout

### Attendance
- POST /api/attendance/check-in - QR code check-in
- GET /api/attendance/history - Get attendance history

### Leave Requests
- POST /api/leave-requests - Submit leave request
- GET /api/leave-requests - Get leave request history
- PUT /api/leave-requests/:id - Update leave request status

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details

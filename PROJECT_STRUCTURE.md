# EnglishHop - Project Structure

## Directory Layout

```
teacher_website/
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Navigation header with auth state
│   │   └── Protected.jsx        # Route protection wrapper
│   │
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   │
│   │   ├── auth/
│   │   │   ├── Login.jsx       # Login page
│   │   │   └── Register.jsx    # Registration page
│   │   │
│   │   ├── teacher/
│   │   │   ├── TeacherDashboard.jsx   # Teacher overview
│   │   │   ├── BuySlots.jsx           # Purchase student slots
│   │   │   ├── TeacherStudents.jsx    # View matched students
│   │   │   └── SetRate.jsx            # Configure hourly rate
│   │   │
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx   # Student overview
│   │   │   └── StudentPay.jsx         # Payment interface
│   │   │
│   │   └── admin/
│   │       ├── AdminDashboard.jsx     # Admin overview
│   │       ├── AdminTeachers.jsx      # Teacher management
│   │       ├── AdminStudents.jsx      # Student management
│   │       └── AdminMatch.jsx         # Match students to teachers
│   │
│   ├── lib/
│   │   └── mockFirebase.js     # Mock Firebase implementation
│   │
│   ├── App.jsx                 # Main app with routing
│   ├── App.css                 # Application styles
│   ├── index.css               # Base styles
│   └── main.jsx                # Entry point
│
├── public/
├── _backup/                    # Original files backup
├── package.json
└── vite.config.js
```

## Component Organization

### Components (`/components`)
Reusable UI components used across multiple pages:
- **Header**: Global navigation and authentication state
- **Protected**: Route wrapper for role-based access control

### Pages (`/pages`)
Page-level components organized by feature:

#### Public Pages
- **Home**: Marketing landing page
- **Login**: User authentication
- **Register**: New user registration

#### Teacher Portal (`/teacher`)
- **TeacherDashboard**: Overview with slot count and student stats
- **BuySlots**: Purchase advertising slots
- **TeacherStudents**: View and manage matched students
- **SetRate**: Configure pricing and payment method

#### Student Portal (`/student`)
- **StudentDashboard**: View matched teacher information
- **StudentPay**: Process lesson payments

#### Admin Portal (`/admin`)
- **AdminDashboard**: Administrative overview
- **AdminTeachers**: Manage teacher accounts
- **AdminStudents**: Manage student accounts
- **AdminMatch**: Assign students to teachers

### Library (`/lib`)
- **mockFirebase.js**: LocalStorage-based Firebase simulation for development

## Key Features

### Authentication
- Email/password authentication
- Role-based access (Teacher, Student, Admin)
- Protected routes by role
- Demo accounts pre-configured

### Teacher Features
- Purchase student slots
- Set hourly rates
- Choose payment method (Direct or Platform)
- View matched students
- Track slot availability

### Student Features
- View matched teacher
- Pay for lessons
- See payment breakdown

### Admin Features
- View all teachers and students
- Match students to teachers
- Configure rates and payment methods
- Manage slot allocation

## Demo Credentials

- **Admin**: admin@englishhop.com / admin123
- **Teacher**: john@mail.com / teacher123
- **Student**: sandra@mail.com / student123

## Development

```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
```

## Tech Stack

- **React 18** - UI framework
- **React Router v6** - Routing
- **Vite** - Build tool
- **LocalStorage** - Mock database
- **CSS3** - Styling with custom properties

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { NotificationProvider } from './contexts/NotificationContext';

// Components
import Header from './components/Header';
import Protected from './components/Protected';
import Footer from './components/footer';

// Layouts
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import BrowseTeachers from './pages/BrowseTeachers';
import TeacherDetails from './pages/TeacherDetails';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import BuySlots from './pages/teacher/BuySlots';
import TeacherStudents from './pages/teacher/TeacherStudents';
import SetRate from './pages/teacher/SetRate';
import TeacherPayments from './pages/teacher/TeacherPayments';
import TeacherChat from './pages/teacher/TeacherChat';
import TeacherProfile from './pages/teacher/TeacherProfile';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentPay from './pages/student/StudentPay';
import StudentProfile from './pages/student/StudentProfile';
import StudentChat from './pages/student/StudentChat';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminMatch from './pages/admin/AdminMatch';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/browse-teachers" element={<BrowseTeachers />} />
              <Route path="/teacher-profile/:teacherId" element={<TeacherDetails />} />

              {/* Teacher Routes - Nested */}
              <Route path="/teacher" element={<Protected role="teacher"><TeacherLayout /></Protected>}>
                <Route index element={<TeacherDashboard />} />
                <Route path="buy-slots" element={<BuySlots />} />
                <Route path="students" element={<TeacherStudents />} />
                <Route path="rate" element={<SetRate />} />
                <Route path="payments" element={<TeacherPayments />} />
                <Route path="chat" element={<TeacherChat />} />
                <Route path="profile" element={<TeacherProfile />} />
              </Route>

              {/* Student Routes - Nested */}
              <Route path="/student" element={<Protected role="student"><StudentLayout /></Protected>}>
                <Route index element={<StudentDashboard />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="pay" element={<StudentPay />} />
                <Route path="chat" element={<StudentChat />} />
              </Route>

              {/* Admin Routes - Nested */}
              <Route path="/admin" element={<Protected role="admin"><AdminLayout /></Protected>}>
                <Route index element={<AdminDashboard />} />
                <Route path="teachers" element={<AdminTeachers />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="match" element={<AdminMatch />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;

import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Briefcase, GraduationCap, Link2 } from 'lucide-react';

function AdminLayout() {
    return (
        <div className="dashboard-layout">
            <div className="container">
                <div className="dashboard-header">
                    <h2>Admin Dashboard</h2>
                    <nav className="dashboard-nav">
                        <Link to="/admin" className="btn-secondary">
                            <LayoutDashboard size={18} />
                            <span>Overview</span>
                        </Link>
                        <Link to="/admin/teachers" className="btn-secondary">
                            <Briefcase size={18} />
                            <span>Teachers</span>
                        </Link>
                        <Link to="/admin/students" className="btn-secondary">
                            <GraduationCap size={18} />
                            <span>Students</span>
                        </Link>
                        <Link to="/admin/match" className="btn-secondary">
                            <Link2 size={18} />
                            <span>Match Student</span>
                        </Link>
                    </nav>
                </div>
                <div className="dashboard-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;

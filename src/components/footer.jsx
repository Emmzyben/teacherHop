import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Facebook, Twitter, Instagram } from 'lucide-react';

function Footer() {
    return (
        <footer className="app-footer">
            <div className="container">
                <div className="footer-grid">

                    {/* Logo + Description */}
                    <div className="footer-section">
                        <div className="footer-logo">
                            <div className="logo-icon">E</div>
                            <span className="logo-text">EnglishHop</span>
                        </div>
                        <p className="footer-desc">
                            Connecting English learners with certified teachers worldwide.
                            Learn. Teach. Grow.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4 className="footer-title">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/register">Find a Teacher</Link></li>
                            <li><Link to="/register">Become a Teacher</Link></li>
                            <li><Link to="/login">Login</Link></li>
                        </ul>
                    </div>

                    {/* For Teachers */}
                    <div className="footer-section">
                        <h4 className="footer-title">For Teachers</h4>
                        <ul className="footer-links">
                            <li><Link to="/register">Create Profile</Link></li>
                            <li><Link to="/register">Buy Student Slots</Link></li>
                            <li><Link to="/register">Advertise Yourself</Link></li>
                        </ul>
                    </div>

                    {/* For Students */}
                    <div className="footer-section">
                        <h4 className="footer-title">For Students</h4>
                        <ul className="footer-links">
                            <li><Link to="/register">Search Tutors</Link></li>
                            <li><Link to="/register">Book Lessons</Link></li>
                            <li><Link to="/register">Learning Dashboard</Link></li>
                        </ul>
                    </div>
                </div>

                <hr className="footer-divider" />

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} EnglishHop. All rights reserved.</p>
                    <div className="footer-socials">
                        <a href="#"><Globe size={20} /></a>
                        <a href="#"><Facebook size={20} /></a>
                        <a href="#"><Twitter size={20} /></a>
                        <a href="#"><Instagram size={20} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

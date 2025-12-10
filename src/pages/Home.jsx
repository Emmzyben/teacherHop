import React from 'react';
import { Link } from 'react-router-dom';
import {
    UserPlus,
    CreditCard,
    Megaphone,
    Search,
    Calendar,
    MessageCircle,
    Plus,
    Minus
} from 'lucide-react';

function Home() {
    const [openFaq, setOpenFaq] = React.useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="home-page">
            <section className="hero">
                <div className="container">
                    <h1>
                        Learn English With The Right<br />
                        <span className="highlight">Teacher — Anytime, Anywhere</span>
                    </h1>
                    <p className="hero-subtitle">
                        Find qualified English tutors, book lessons instantly, and start learning.<br />
                        Teachers can join, advertise, and get students fast.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/browse-teachers" className="btn-primary-lg">Browse Teachers</Link>
                        <Link to="/register" className="btn-secondary-lg">Become a Teacher</Link>
                    </div>

                    <div className="stats">
                        <div className="stat-item">
                            <h3>500+</h3>
                            <p>Verified Teachers</p>
                        </div>
                        <div className="stat-item">
                            <h3>10K+</h3>
                            <p>Active Students</p>
                        </div>
                        <div className="stat-item">
                            <h3>50K+</h3>
                            <p>Lessons Completed</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ------------------- TEACHERS SECTION ------------------- */}
            <section className="section-padded">
                <div className="container text-center">
                    <div className="badge">For Teachers</div>
                    <h2>Grow Your Teaching Business</h2>
                    <p className="subtitle">
                        Join our platform and reach thousands of eager English learners
                    </p>

                    <div className="cards">
                        <div className="card">
                            <div className="card-icon">
                                <UserPlus size={32} color="#0066ff" />
                            </div>
                            <h3>Create Your Teaching Profile</h3>
                            <p>
                                Add your experience, pricing, availability, intro video, and subjects.
                            </p>
                        </div>

                        <div className="card">
                            <div className="card-icon">
                                <CreditCard size={32} color="#0066ff" />
                            </div>
                            <h3>Choose How You Want to Get Paid</h3>
                            <p>
                                Receive payments directly from students or use our platform’s secure payment system.
                            </p>
                        </div>

                        <div className="card">
                            <div className="card-icon">
                                <Megaphone size={32} color="#0066ff" />
                            </div>
                            <h3>Buy Ad Packages & Get Students</h3>
                            <p>
                                Pay for the number of students you want — we match them to you instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ------------------- STUDENTS SECTION ------------------- */}
            <section className="section-padded bg-light">
                <div className="container text-center">
                    <div className="badge">For Students</div>
                    <h2>Learn With Certified English Tutors</h2>
                    <p className="subtitle">
                        Improve your speaking, reading, writing, and exam skills — all at your pace.
                    </p>

                    <div className="cards">
                        <div className="card">
                            <div className="card-icon">
                                <Search size={32} color="#0066ff" />
                            </div>
                            <h3>Find the Right Teacher</h3>
                            <p>
                                Browse verified tutors based on your goals, level, budget, and schedule.
                            </p>
                        </div>

                        <div className="card">
                            <div className="card-icon">
                                <Calendar size={32} color="#0066ff" />
                            </div>
                            <h3>Book Lessons Easily</h3>
                            <p>
                                Select available times, book instantly, and learn from anywhere.
                            </p>
                        </div>

                        <div className="card">
                            <div className="card-icon">
                                <MessageCircle size={32} color="#0066ff" />
                            </div>
                            <h3>Flexible Learning</h3>
                            <p>
                                Choose conversation practice, grammar lessons, exam prep, or business English.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ------------------- FAQ SECTION ------------------- */}
            <section className="section-padded">
                <div className="container">
                    <div className="text-center mb-4">
                        <h2>Frequently Asked Questions</h2>
                        <p className="subtitle">Everything you need to know about the platform</p>
                    </div>

                    <div className="faq-container">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`faq-item ${openFaq === index ? 'active' : ''}`}
                                onClick={() => toggleFaq(index)}
                            >
                                <div className="faq-question">
                                    <h3>{faq.question}</h3>
                                    <span className="faq-icon">
                                        {openFaq === index ? <Minus size={20} /> : <Plus size={20} />}
                                    </span>
                                </div>
                                <div className="faq-answer">
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

const faqs = [
    {
        question: "How do I find a teacher?",
        answer: "Browse our teacher directory, view their profiles, and choose the one that best fits your learning goals and schedule. You can start learning immediately!"
    },

    {
        question: "How do payments work?",
        answer: "We use a secure payment system. You pay for lessons or packages through the platform, and we hold the funds until the lesson is completed to ensure your satisfaction."
    },
    {
        question: "Can I change my teacher?",
        answer: "Absolutely! You are not locked into one teacher. You can learn with as many different teachers as you like to get different perspectives and accents."
    },
    {
        question: "What if I need to cancel a lesson?",
        answer: "You can cancel or reschedule a lesson up to 24 hours before the start time for free. Late cancellations may be subject to a fee depending on the teacher's policy."
    }

];

export default Home;

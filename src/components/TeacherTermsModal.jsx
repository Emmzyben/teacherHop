import React from 'react';
import { X, CheckCircle, Sparkles } from 'lucide-react';

const TeacherTermsModal = ({ isOpen, onClose, onProceed }) => {
    if (!isOpen) return null;

    const terms = [
        {
            number: "01",
            title: "Buy Your Student Slots",
            content: "Purchase the number of students you want to teach. This fee is used by EnglishHop to advertise and bring students directly to you.",
            highlight: "Investment in Growth"
        },
        {
            number: "02",
            title: "Get Matched with Students",
            content: "Once students are matched to you, you have full control over pricing. Set your hourly rate or negotiate individually with each student.",
            highlight: "Your Pricing, Your Choice"
        },
        {
            number: "03",
            title: "Teaching and Payment",
            content: "Teach your assigned students using your own style and methodology. Students can pay through your preferred method or via our integrated payment system.",
            highlight: "Flexible Payment Options"
        },
        {
            number: "04",
            title: "Platform Fees",
            content: "If using EnglishHop's payment system, we take a 15% service fee. Otherwise, 100% of the payment goes directly to you.",
            highlight: "Transparent Pricing"
        },
        {
            number: "05",
            title: "Complete Flexibility",
            content: "We handle student matching and advertising while you maintain full control over your teaching schedule, pricing, and teaching approach.",
            highlight: "You're in Control"
        }
    ];

    return (
        <>
            <style>{`
                .teacher-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 1rem;
                    animation: teacherModalFadeIn 0.3s ease;
                }

                .teacher-modal-content {
                    background: white;
                    border-radius: 24px;
                    width: 100%;
                    max-width: 750px;
                    max-height: 90vh;
                    overflow: hidden;
                    position: relative;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    display: flex;
                    flex-direction: column;
                    animation: teacherModalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .teacher-modal-close {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    background: white;
                    border: none;
                    color: #555;
                    cursor: pointer;
                    padding: 0.75rem;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                    z-index: 10;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .teacher-modal-close:hover {
                    background: #f8f9ff;
                    color: #ef4444;
                    transform: rotate(90deg);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
                }

                .teacher-modal-header-gradient {
                    padding: 3rem 2.5rem 2rem;
                    background: linear-gradient(135deg, #0066ff 0%, #0052cc 50%, #003d99 100%);
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .teacher-modal-header-gradient::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -10%;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                    border-radius: 50%;
                }

                .teacher-modal-icon-large {
                    width: 80px;
                    height: 80px;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    color: white;
                    border-radius: 20px;
                    display: grid;
                    place-items: center;
                    margin: 0 auto 1.5rem;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }

                .teacher-modal-header-gradient h2 {
                    font-size: 1.75rem;
                    margin-bottom: 0.75rem;
                    color: white;
                    font-weight: 700;
                    line-height: 1.2;
                }

                .teacher-modal-subtitle {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 1rem;
                    margin: 0;
                    font-weight: 400;
                }

                .teacher-modal-body-premium {
                    padding: 2rem 2.5rem;
                    overflow-y: auto;
                    background: #f8f9ff;
                }

                .teacher-term-card {
                    display: flex;
                    gap: 1.25rem;
                    padding: 1.75rem;
                    background: white;
                    border-radius: 16px;
                    margin-bottom: 1.25rem;
                    border: 2px solid transparent;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .teacher-term-card:hover {
                    border-color: #0066ff;
                    box-shadow: 0 8px 24px rgba(0, 102, 255, 0.12);
                    transform: translateY(-2px);
                }

                .teacher-term-card:last-child {
                    margin-bottom: 0;
                }

                .teacher-term-number-badge {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);
                    border-radius: 14px;
                    display: grid;
                    place-items: center;
                    flex-shrink: 0;
                    box-shadow: 0 4px 16px rgba(0, 102, 255, 0.25);
                    position: relative;
                    overflow: hidden;
                }

                .teacher-term-number-badge::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                    transform: rotate(45deg);
                    animation: teacherShimmer 3s infinite;
                }

                .teacher-term-number-badge span {
                    color: white;
                    font-size: 1.25rem;
                    font-weight: 700;
                    position: relative;
                    z-index: 1;
                }

                .teacher-term-content {
                    flex: 1;
                    min-width: 0;
                }

                .teacher-term-header-row {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 1rem;
                    margin-bottom: 0.75rem;
                    flex-wrap: wrap;
                }

                .teacher-term-content h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1a1a2e;
                    margin: 0;
                    line-height: 1.3;
                }

                .teacher-term-highlight-badge {
                    display: inline-block;
                    padding: 0.375rem 0.875rem;
                    background: linear-gradient(135deg, #eef4ff 0%, #e0ecff 100%);
                    color: #0066ff;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    white-space: nowrap;
                    border: 1px solid rgba(0, 102, 255, 0.2);
                }

                .teacher-term-content p {
                    color: #555;
                    font-size: 0.9375rem;
                    line-height: 1.6;
                    margin: 0;
                }

                .teacher-modal-footer-premium {
                    padding: 1.5rem 2.5rem;
                    border-top: 1px solid #e0e0e0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    background: white;
                }

                .teacher-btn-modal-secondary,
                .teacher-btn-modal-primary {
                    padding: 0.875rem 1.75rem;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.9375rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    white-space: nowrap;
                }

                .teacher-btn-modal-secondary {
                    background: white;
                    color: #555;
                    border: 2px solid #e0e0e0;
                }

                .teacher-btn-modal-secondary:hover {
                    background: #f8f9ff;
                    border-color: #555;
                    color: #1a1a2e;
                }

                .teacher-btn-modal-primary {
                    background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);
                    color: white;
                    box-shadow: 0 4px 16px rgba(0, 102, 255, 0.3);
                }

                .teacher-btn-modal-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 102, 255, 0.4);
                }

                .teacher-btn-modal-primary:active {
                    transform: translateY(0);
                }

                @keyframes teacherModalFadeIn {
                    from { 
                        opacity: 0; 
                    }
                    to { 
                        opacity: 1; 
                    }
                }

                @keyframes teacherModalSlideUp {
                    from { 
                        transform: translateY(40px) scale(0.95); 
                        opacity: 0; 
                    }
                    to { 
                        transform: translateY(0) scale(1); 
                        opacity: 1; 
                    }
                }

                @keyframes teacherShimmer {
                    0% {
                        transform: translateX(-100%) translateY(-100%) rotate(45deg);
                    }
                    100% {
                        transform: translateX(100%) translateY(100%) rotate(45deg);
                    }
                }

                @media (max-width: 768px) {
                    .teacher-modal-content {
                        max-height: 100%;
                        border-radius: 16px;
                    }
                    
                    .teacher-modal-header-gradient {
                        padding: 2.5rem 1.5rem 1.5rem;
                    }

                    .teacher-modal-header-gradient h2 {
                        font-size: 1.5rem;
                    }

                    .teacher-modal-icon-large {
                        width: 64px;
                        height: 64px;
                    }
                    
                    .teacher-modal-body-premium {
                        padding: 1.5rem;
                    }

                    .teacher-term-card {
                        flex-direction: column;
                        padding: 1.25rem;
                        gap: 1rem;
                    }

                    .teacher-term-number-badge {
                        width: 48px;
                        height: 48px;
                    }

                    .teacher-term-number-badge span {
                        font-size: 1.125rem;
                    }

                    .teacher-term-header-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .teacher-modal-footer-premium {
                        padding: 1rem 1.5rem;
                        flex-direction: column;
                        gap: 0.75rem;
                    }
                    
                    .teacher-btn-modal-secondary,
                    .teacher-btn-modal-primary {
                        width: 100%;
                        justify-content: center;
                        padding: 1rem;
                    }
                }

                @media (max-width: 640px) {
                    .teacher-modal-overlay {
                        padding: 0;
                    }

                    .teacher-modal-content {
                        height: 100%;
                        max-height: 100%;
                        border-radius: 0;
                    }
                }
            `}</style>

            <div className="teacher-modal-overlay" onClick={onClose}>
                <div className="teacher-modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="teacher-modal-close" onClick={onClose} aria-label="Close modal">
                        <X size={24} />
                    </button>

                    <div className="teacher-modal-header-gradient">
                        <div className="teacher-modal-icon-large">
                            <Sparkles size={40} />
                        </div>
                        <h2>How EnglishHop Works for Teachers</h2>
                        <p className="teacher-modal-subtitle">Understand the platform before you begin your journey</p>
                    </div>

                    <div className="teacher-modal-body-premium">
                        {terms.map((term, index) => (
                            <div key={index} className="teacher-term-card">
                                <div className="teacher-term-number-badge">
                                    <span>{term.number}</span>
                                </div>
                                <div className="teacher-term-content">
                                    <div className="teacher-term-header-row">
                                        <h3>{term.title}</h3>
                                        <span className="teacher-term-highlight-badge">{term.highlight}</span>
                                    </div>
                                    <p>{term.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="teacher-modal-footer-premium">
                        <button className="teacher-btn-modal-secondary" onClick={onClose}>
                            Maybe Later
                        </button>
                        <button className="teacher-btn-modal-primary" onClick={onProceed}>
                            <CheckCircle size={18} />
                            <span>I Understand, Let's Begin</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherTermsModal;

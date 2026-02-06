import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, HelpCircle, X } from 'lucide-react';

const AlertModal = ({ isOpen, type = 'success', message, onClose, onConfirm }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAnimate(true);
        } else {
            setAnimate(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    let icon, color, title;
    // Define styles based on type
    if (type === 'error') {
        icon = <AlertTriangle size={40} />;
        color = '#ef4444'; // Red
        title = '알림';
    } else if (type === 'confirm') {
        icon = <HelpCircle size={40} />;
        color = '#3b82f6'; // Blue
        title = '확인';
    } else {
        icon = <CheckCircle size={40} />;
        color = '#22c55e'; // Green
        title = '성공';
    }

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 3000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: animate ? 1 : 0, transition: 'opacity 0.2s'
        }}>
            <div className="glass-panel" style={{
                position: 'relative',
                width: '300px',
                padding: '30px 20px',
                borderRadius: '20px',
                background: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                transform: animate ? 'scale(1)' : 'scale(0.9)',
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                <div style={{
                    width: '70px', height: '70px',
                    borderRadius: '50%',
                    background: `${color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '15px',
                    color: color
                }}>
                    {icon}
                </div>

                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
                    {title}
                </div>

                <div style={{ fontSize: '0.95rem', color: '#cbd5e1', textAlign: 'center', marginBottom: '25px', lineHeight: '1.4' }}>
                    {message}
                </div>

                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    {type === 'confirm' ? (
                        <>
                            <button
                                onClick={onClose}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                                    background: '#475569', color: '#fff', fontSize: '0.9rem', cursor: 'pointer'
                                }}
                            >
                                아니오
                            </button>
                            <button
                                onClick={() => { onConfirm(); onClose(); }}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                                    background: color, color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer'
                                }}
                            >
                                예
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                                background: color, color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer'
                            }}
                        >
                            확인
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AlertModal;

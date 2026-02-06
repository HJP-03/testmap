import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Coffee, BookOpen, Volume2 } from 'lucide-react';

const MeasurementResultModal = ({ isOpen, onClose, db }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAnimate(true);
        } else {
            setAnimate(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Determine status based on dB
    let status = { text: '조용함', color: '#4ade80', icon: Coffee, desc: '대화하기 좋은 장소예요.' };
    if (db > 50) status = { text: '적당함', color: '#facc15', icon: BookOpen, desc: '약간의 소음이 있어요.' };
    if (db > 70) status = { text: '시끄러움', color: '#f87171', icon: Volume2, desc: '오래 머물기 피곤할 수 있어요.' };

    const Icon = status.icon;

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: animate ? 1 : 0, transition: 'opacity 0.3s'
        }}>
            <div style={{
                position: 'relative',
                width: '320px',
                padding: '30px 20px',
                background: 'rgba(30, 41, 59, 0.9)',
                backdropFilter: 'blur(16px)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                textAlign: 'center',
                transform: animate ? 'scale(1)' : 'scale(0.9)',
                transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '15px', right: '15px',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{
                    width: '80px', height: '80px',
                    borderRadius: '50%',
                    background: `${status.color}20`, // 20% opacity
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px auto',
                    color: status.color
                }}>
                    <Icon size={40} />
                </div>

                <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#fff', lineHeight: '1', marginBottom: '10px' }}>
                    {db} <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>dB</span>
                </div>

                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: status.color, marginBottom: '5px' }}>
                    {status.text}
                </div>

                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '25px' }}>
                    {status.desc}
                </div>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#475569',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: '0.2s'
                    }}
                >
                    확인
                </button>

            </div>
        </div>
    );
};

export default MeasurementResultModal;

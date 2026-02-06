import React from 'react';
import { X, Brain } from 'lucide-react';

const AiPredictionList = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px', height: '400px',
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Brain color="#4ade80" size={24} />
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>AI 실시간 예측 목록</h3>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <X size={24} />
                </button>
            </div>

            {/* Table Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #475569', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>시간</th>
                            <th style={{ padding: '10px' }}>장소</th>
                            <th style={{ padding: '10px' }}>혼잡도</th>
                            <th style={{ padding: '10px' }}>정확도</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{item.time}</td>
                                <td style={{ padding: '12px 10px', fontWeight: 'bold' }}>{item.place}</td>
                                <td style={{ padding: '12px 10px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem',
                                        backgroundColor: item.level === '여유' ? 'rgba(34, 197, 94, 0.2)' :
                                            item.level === '보통' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        color: item.level === '여유' ? '#4ade80' :
                                            item.level === '보통' ? '#facc15' : '#f87171'
                                    }}>
                                        {item.level}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 10px', color: '#64748b' }}>{item.accuracy}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        데이터 수집 중...
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiPredictionList;

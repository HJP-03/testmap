import React from 'react';
import { Activity, BarChart2, CheckCircle, Brain, ArrowUpRight } from 'lucide-react';

const BottomPanel = ({ currentDb, measuring, userCount = 5, onOpenAiList, latestPrediction }) => {
    return (
        <div style={{
            /* Position handled by parent in App.jsx */
            width: '100%',
            padding: '20px',
            boxSizing: 'border-box',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
        }}>
            {/* Heatmap & Status Section */}
            <div className="glass-panel" style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(30, 41, 59, 0.7)'
            }}>
                <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>실시간 소음 (Heatmap)</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1' }}>
                        {measuring ? currentDb : '--'} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>dB</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#4ade80', marginTop: '5px' }}>
                        {measuring ? '측정 중...' : '대기 중'}
                    </div>
                </div>

                <div style={{ flex: 1, height: '60px', margin: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Placeholder for Waveform */}
                    <Activity color="#4ade80" size={48} style={{ opacity: measuring ? 1 : 0.3 }} />
                </div>


            </div>

            {/* Geo-Fence Status */}
            <div className="glass-panel" style={{
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.9rem'
            }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }}></div>
                <div style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>위치 인증됨.</span> 측정 데이터가 지도에 반영됩니다.
                </div>
            </div>

            {/* Prediction & Contribute */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <div className="glass-panel" style={{
                    flex: 1,
                    padding: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <div style={{ background: '#475569', borderRadius: '50%', padding: '8px' }}>
                        <Brain size={20} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>AI 예측 ({latestPrediction ? latestPrediction.time : '--:--'})</div>
                        <div style={{ fontSize: '0.9rem' }}>
                            {latestPrediction
                                ? `${latestPrediction.place} : ${latestPrediction.level} (정확도 ${latestPrediction.accuracy}%)`
                                : '데이터 수집 중...'}
                        </div>
                    </div>
                </div>

                <button
                    onClick={onOpenAiList}
                    className="glass-panel" style={{
                        padding: '0 25px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        background: '#475569',
                        border: 'none',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}>
                    AI 실시간 목록
                </button>
            </div>
        </div>
    );
};


export default BottomPanel;

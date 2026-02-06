import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Tag, Send } from 'lucide-react';
import { socket } from '../services/socket';

const PlaceDetailModal = ({ isOpen, onClose, markerData, reviews = [] }) => {
    const [comment, setComment] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);

    if (!isOpen || !markerData) return null;

    const tags = ['🔌 콘센트 있음', '📚 공부하기 좋음', '☕ 커피 맛집', '🤫 진짜 조용함', '👥 사람들 많음'];

    const handleTagClick = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag));
        } else {
            setSelectedTags(prev => [...prev, tag]);
        }
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (!comment && selectedTags.length === 0) return;

        const reviewData = {
            markerId: markerData.id || markerData.timestamp,
            text: comment,
            tags: selectedTags,
            timestamp: Date.now()
        };

        socket.emit('submit_review', reviewData);
        setComment('');
        setSelectedTags([]);
        // Optimistic update handled by parent or socket listener
    };

    // Style logic based on dB
    const getLevelInfo = (db) => {
        if (db <= 50) return { color: '#22c55e', text: '여유로움', description: '책 읽거나 작업하기 딱 좋은 소음이에요.' };
        if (db <= 70) return { color: '#eab308', text: '보통', description: '일상적인 대화가 오가는 정도예요.' };
        return { color: '#ef4444', text: '시끄러움', description: '집중하기엔 다소 소란스러워요.' };
    };

    const info = getLevelInfo(markerData.db);

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2500,
            display: 'flex', alignItems: 'end', justifyContent: 'center'
        }} onClick={onClose}>
            <div className="glass-panel" style={{
                width: '100%', maxWidth: '500px', height: '80%',
                background: 'rgba(30, 41, 59, 0.98)',
                borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
                padding: '20px', display: 'flex', flexDirection: 'column',
                animation: 'slideUp 0.3s ease-out'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>측정 시간: {new Date(markerData.timestamp).toLocaleTimeString()}</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0', color: info.color }}>
                            {markerData.db} dB <span style={{ fontSize: '1rem', color: '#fff' }}>({info.text})</span>
                        </h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                    <p style={{ margin: 0, color: '#e2e8f0', lineHeight: '1.4' }}>{info.description}</p>
                </div>

                {/* Review List */}
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '15px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MessageSquare size={16} /> 방문자 리뷰 ({reviews.length})
                    </h3>

                    {reviews.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                            아직 리뷰가 없습니다.<br />첫 번째 리뷰를 남겨보세요!
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {reviews.map((rev, idx) => (
                                <div key={idx} style={{ background: '#334155', padding: '10px', borderRadius: '10px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '5px' }}>
                                        {rev.tags && rev.tags.map((tag, i) => (
                                            <span key={i} style={{ fontSize: '0.7rem', background: '#475569', padding: '2px 6px', borderRadius: '4px', color: '#cbd5e1' }}>#{tag}</span>
                                        ))}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>{rev.text}</p>
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '5px', textAlign: 'right' }}>
                                        {new Date(rev.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmitReview} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '5px' }}>
                        {tags.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => handleTagClick(tag)}
                                style={{
                                    flex: '0 0 auto', padding: '5px 10px', borderRadius: '15px', border: 'none',
                                    fontSize: '0.8rem', cursor: 'pointer', transition: '0.2s',
                                    background: selectedTags.includes(tag) ? info.color : '#334155',
                                    color: selectedTags.includes(tag) ? '#000' : '#cbd5e1',
                                    fontWeight: selectedTags.includes(tag) ? 'bold' : 'normal'
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="이 장소는 어땠나요?"
                            style={{
                                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                                background: '#1e293b', color: '#fff', outline: 'none'
                            }}
                        />
                        <button type="submit" style={{
                            padding: '12px', borderRadius: '12px', border: 'none',
                            background: info.color, color: '#fff', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Send size={18} />
                        </button>
                    </div>
                </form>

            </div>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default PlaceDetailModal;

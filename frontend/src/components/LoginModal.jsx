import React, { useState } from 'react';
import { X, User, Lock, ArrowRight } from 'lucide-react';

const LoginModal = ({ isOpen, onClose, onLogin, showAlert }) => {
    const [isLoginTab, setIsLoginTab] = useState(true);
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isLoginTab) {
            // Hardcoded Admin Check
            if (id === 'admin1234' && password === 'admin1234') {
                onLogin(true); // isAdmin = true
                showAlert("관리자 모드로 로그인되었습니다.", "success");
                onClose();
            } else if (id && password) {
                onLogin(false); // Normal user
                showAlert("로그인되었습니다.", "success");
                onClose();
            } else {
                showAlert("아이디와 비밀번호를 입력해주세요.", "error");
            }
        } else {
            // Signup Mock
            showAlert("회원가입이 완료되었습니다! (로그인 해주세요)", "success");
            setIsLoginTab(true);
        }
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="glass-panel" style={{
                position: 'relative',
                width: '320px',
                padding: '30px',
                borderRadius: '24px',
                background: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '15px', right: '15px',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'
                }}>
                    <X size={24} />
                </button>

                <h2 style={{ margin: '0 0 20px 0', textAlign: 'center', color: '#fff' }}>
                    {isLoginTab ? '로그인' : '회원가입'}
                </h2>

                <div style={{ display: 'flex', marginBottom: '20px', background: '#1e293b', borderRadius: '12px', padding: '4px' }}>
                    <div
                        onClick={() => setIsLoginTab(true)}
                        style={{
                            flex: 1, textAlign: 'center', padding: '8px',
                            borderRadius: '8px', cursor: 'pointer',
                            background: isLoginTab ? '#475569' : 'transparent',
                            color: isLoginTab ? '#fff' : '#94a3b8', transition: '0.3s'
                        }}
                    >로그인</div>
                    <div
                        onClick={() => setIsLoginTab(false)}
                        style={{
                            flex: 1, textAlign: 'center', padding: '8px',
                            borderRadius: '8px', cursor: 'pointer',
                            background: !isLoginTab ? '#475569' : 'transparent',
                            color: !isLoginTab ? '#fff' : '#94a3b8', transition: '0.3s'
                        }}
                    >회원가입</div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                            type="text"
                            placeholder="아이디"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 12px 12px 40px',
                                background: '#334155', border: 'none', borderRadius: '12px',
                                color: '#fff', outline: 'none', boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 12px 12px 40px',
                                background: '#334155', border: 'none', borderRadius: '12px',
                                color: '#fff', outline: 'none', boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button type="submit" style={{
                        marginTop: '10px',
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#22c55e',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                        {isLoginTab ? '로그인 하기' : '가입하기'} <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;

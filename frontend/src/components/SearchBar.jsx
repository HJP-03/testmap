import { Search, MapPin } from 'lucide-react';
import { useState } from 'react';

const SearchBar = ({ onSearch, onResetLocation }) => {
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Search submitted:', query);
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <div className="search-container" style={{
            position: 'absolute',
            top: window.innerWidth < 600 ? '140px' : '85px', // 필터 바 아래로 내림
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'row',
            gap: '10px',
            alignItems: 'center',
            width: 'auto',
            maxWidth: '95%'
        }}>
            {/* Search Bar - Always Visible */}
            <form onSubmit={handleSearch} className="search-form" style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                width: '100%'
            }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="장소 검색 (예: 강남역, 스타벅스)"
                    className="search-input"
                    style={{
                        padding: '12px 20px',
                        borderRadius: '25px',
                        border: '2px solid #000',
                        outline: 'none',
                        width: window.innerWidth < 600 ? '100%' : '300px',
                        flex: window.innerWidth < 600 ? 1 : 'none',
                        fontSize: '0.95rem',
                        background: '#fff',
                        color: '#000',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        fontWeight: '500'
                    }}
                />
                <button
                    type="submit"
                    title="검색"
                    className="search-btn"
                    style={{
                        width: window.innerWidth < 600 ? '40px' : '45px',
                        height: window.innerWidth < 600 ? '40px' : '45px',
                        minWidth: window.innerWidth < 600 ? '40px' : '45px',
                        borderRadius: '50%',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#000',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Search size={22} color="#fff" />
                </button>

                {/* Reset Location Button - Now on the right */}
                <button
                    onClick={onResetLocation}
                    type="button"
                    title="내 위치로 돌아가기"
                    className="locate-btn"
                    style={{
                        width: window.innerWidth < 600 ? '40px' : '45px',
                        height: window.innerWidth < 600 ? '40px' : '45px',
                        minWidth: window.innerWidth < 600 ? '40px' : '45px',
                        borderRadius: '50%',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#000',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <MapPin size={20} color="#fff" />
                </button>
            </form>
        </div>
    );
};

export default SearchBar;

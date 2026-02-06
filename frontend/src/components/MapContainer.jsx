import { useEffect, useRef, useState } from 'react';
import { socket } from '../services/socket';
import SearchBar from './SearchBar';

const MapContainer = ({ userLocation, isAdmin, showConfirm, onMarkerClick, filterMode = 'all' }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [noiseData, setNoiseData] = useState([]);
    const overlaysRef = useRef([]); // Changed from circlesRef
    const userMarkerRef = useRef(null);
    const initialCenterRef = useRef(null); // Store initial center for reset

    useEffect(() => {
        // Socket Listeners
        socket.on('connect', () => {
            console.log('Socket Connected! ID:', socket.id);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket Connection Error:', err);
        });

        socket.on('initial_data', (data) => {
            console.log('Initial data:', data);
            setNoiseData(data);
        });

        socket.on('new_noise_report', (report) => {
            console.log('New report:', report);
            setNoiseData(prev => [...prev, report]);
        });

        // Listen for deletion (if backend marks it deleted or we filter locally)
        // For simple robust deletion, we can just request refresh or update list
        // But for now, let's assume client-side optimistic update if needed, but socket sync is better.
        // Let's create a listener if backend broadcasts deletion.
        socket.on('marker_deleted', (id) => {
            setNoiseData(prev => prev.filter(item => item.timestamp !== id && item.id !== id));
        });

        // Robust check for Kakao script
        const checkKakao = setInterval(() => {
            if (window.kakao && window.kakao.maps) {
                clearInterval(checkKakao);
                loadMap();
            }
        }, 500);

        // Timeout after 5 seconds to show error
        const timeout = setTimeout(() => {
            clearInterval(checkKakao);
            // If not loaded by now, mapLoaded stays false, showing error UI
        }, 5000);

        return () => {
            socket.off('initial_data');
            socket.off('new_noise_report');
            socket.off('marker_deleted');
            clearInterval(checkKakao);
            clearTimeout(timeout);
        };
    }, []);

    // Update center and User Marker when userLocation changes OR map loads
    useEffect(() => {
        if (!mapInstance.current || !userLocation) return;

        const moveLatLon = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);
        mapInstance.current.setCenter(moveLatLon);

        // Update User Marker (User Physics)
        if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null); // Remove old
        }

        const content = `
            <div style="
                width: 20px; height: 20px; background: #000; border-radius: 50%; 
                border: 2px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.5);
                position: relative;
            ">
                <div style="
                    position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
                    border-radius: 50%; border: 2px solid #000; opacity: 0.3;
                    animation: pulse 1.5s infinite;
                "></div>
            </div>
        `;

        userMarkerRef.current = new window.kakao.maps.CustomOverlay({
            position: moveLatLon,
            content: content
        });
        userMarkerRef.current.setMap(mapInstance.current);

    }, [userLocation, mapLoaded]); // Added mapLoaded dependency

    // Update Map Overlays when noiseData OR isAdmin OR filterMode changes
    useEffect(() => {
        if (!mapLoaded || !mapInstance.current) return;

        // Clear existing overlays
        overlaysRef.current.forEach(overlay => overlay.setMap(null));
        overlaysRef.current = [];

        // FILTER LOGIC
        const filteredData = noiseData.filter(item => {
            if (filterMode === 'quiet_only') return item.db <= 50;
            return true;
        });

        // DEDUPLICATION: Keep only the latest marker for each location to avoid messy overlaps
        // Group by approximate location (within ~50m radius)
        const locationMap = new Map();

        filteredData.forEach(item => {
            if (!item.location) return;

            // Group by ~0.0005 degrees (approx 50-60m) to prevent overlapping circles
            const precision = 0.0005;
            const latKey = (Math.round(item.location.lat / precision) * precision).toFixed(4);
            const lngKey = (Math.round(item.location.lng / precision) * precision).toFixed(4);
            const locationKey = `${latKey},${lngKey}`;

            const existing = locationMap.get(locationKey);

            // Keep the one with the latest timestamp (most recent noise report)
            if (!existing || item.timestamp > existing.timestamp) {
                locationMap.set(locationKey, item);
            }
        });

        // Convert back to array (only unique locations with latest data)
        const deduplicatedData = Array.from(locationMap.values());

        deduplicatedData.forEach(item => {
            if (!item.location) return;

            // Unique ID for deletion (using timestamp if no id)
            const itemId = item.id || item.timestamp;

            const { lat, lng } = item.location;
            const db = item.db;

            // Style Logic
            let bg = 'rgba(34, 197, 94, 0.4)'; // Green
            let border = '#4ade80';
            let icon = '☕'; // Cafe default
            let text = '조용한 구역';

            if (db > 50) {
                bg = 'rgba(234, 179, 8, 0.4)'; // Yellow
                border = '#facc15';
                icon = '📖'; // Library
                text = '보통';
            }
            if (db > 70) {
                bg = 'rgba(239, 68, 68, 0.4)'; // Red
                border = '#f87171';
                icon = '📢'; // Playground
                text = '시끄러움!';
            }

            // Create HTML Elements Manually to attach Event Listeners
            const contentDiv = document.createElement('div');
            contentDiv.className = 'custom-overlay';
            contentDiv.style.background = bg;
            contentDiv.style.borderColor = border;
            contentDiv.style.cursor = 'pointer'; // Make it look clickable
            contentDiv.innerHTML = `
                <div class="overlay-icon">${icon}</div>
                <div>${text}</div>
                <div style="font-size: 1.2em;">${db} dB</div>
            `;

            // Click to Open Detail
            contentDiv.onclick = (e) => {
                if (onMarkerClick) onMarkerClick(item);
            };

            // Admin Delete Button
            if (isAdmin) {
                const deleteBtn = document.createElement('div');
                deleteBtn.innerHTML = 'X';
                deleteBtn.style.cssText = `
                    position: absolute; top: -10px; right: -10px;
                    width: 24px; height: 24px; background: #ef4444; color: white;
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; font-weight: bold; border: 2px solid white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3); z-index: 10;
                `;
                deleteBtn.onclick = (e) => {
                    e.stopPropagation(); // Prevent modal open

                    // Use Custom Confirm passed from App
                    if (showConfirm) {
                        showConfirm('이 소음 기록을 삭제하시겠습니까?', () => {
                            // Optimistic Update
                            setNoiseData(prev => prev.filter(n => (n.id || n.timestamp) !== itemId));
                            // Notify Server
                            socket.emit('delete_marker', itemId);
                        });
                    } else {
                        // Fallback logic
                        if (confirm('이 소음 기록을 삭제하시겠습니까?')) {
                            setNoiseData(prev => prev.filter(n => (n.id || n.timestamp) !== itemId));
                            socket.emit('delete_marker', itemId);
                        }
                    }
                };
                contentDiv.appendChild(deleteBtn);
            }

            const overlay = new window.kakao.maps.CustomOverlay({
                position: new window.kakao.maps.LatLng(lat, lng),
                content: contentDiv,
                yAnchor: 1
            });

            overlay.setMap(mapInstance.current);
            overlaysRef.current.push(overlay);
        });

    }, [noiseData, mapLoaded, isAdmin, showConfirm, onMarkerClick, filterMode]); // Re-render when admin mode toggles

    const loadMap = () => {
        const container = mapRef.current;
        const centerLat = userLocation ? userLocation.lat : 37.5665;
        const centerLng = userLocation ? userLocation.lng : 126.9780;

        const options = {
            center: new window.kakao.maps.LatLng(centerLat, centerLng),
            level: 3
        };

        try {
            mapInstance.current = new window.kakao.maps.Map(container, options);
            initialCenterRef.current = { lat: centerLat, lng: centerLng }; // Store initial center
            setMapLoaded(true);
        } catch (e) {
            console.error("Map creation failed", e);
        }
    };

    // Search Handler using Kakao Local API
    const handleSearch = (query) => {
        if (!mapInstance.current) return;

        const ps = new window.kakao.maps.services.Places();

        ps.keywordSearch(query, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const firstPlace = data[0];
                const moveLatLon = new window.kakao.maps.LatLng(firstPlace.y, firstPlace.x);
                mapInstance.current.setCenter(moveLatLon);
                mapInstance.current.setLevel(3); // Zoom in
            } else {
                alert('검색 결과가 없습니다.');
            }
        });
    };

    // Reset Location Handler
    const handleResetLocation = () => {
        if (!mapInstance.current) return;

        if (userLocation) {
            // Return to user's current location
            const moveLatLon = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);
            mapInstance.current.setCenter(moveLatLon);
            mapInstance.current.setLevel(3);
        } else if (initialCenterRef.current) {
            // Return to initial center
            const moveLatLon = new window.kakao.maps.LatLng(
                initialCenterRef.current.lat,
                initialCenterRef.current.lng
            );
            mapInstance.current.setCenter(moveLatLon);
            mapInstance.current.setLevel(3);
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>

            {/* Search Bar */}
            {mapLoaded && (
                <SearchBar
                    onSearch={handleSearch}
                    onResetLocation={handleResetLocation}
                />
            )}

            {/* Connection Status Indicator */}
            <div style={{
                position: 'absolute', bottom: '10px', right: '10px', zIndex: 1000,
                background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '15px',
                fontSize: '10px', color: '#fff', display: 'flex', alignItems: 'center', gap: '5px',
                pointerEvents: 'none'
            }}>
                <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: socket.connected ? '#4ade80' : '#ef4444'
                }}></div>
                {socket.connected ? '서버 연결됨' : '서버 연결 안됨 (인증서 승인 필요)'}
            </div>

            {!mapLoaded && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(30, 41, 59, 0.9)', color: '#fff',
                    flexDirection: 'column', gap: '15px', zIndex: 1000, padding: '20px', textAlign: 'center'
                }}>
                    <h3 style={{ margin: 0 }}>지도 초기화 중...</h3>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                        <p>• Kakao API: {window.kakao ? '✅ 연결됨' : '❌ 대기 중'}</p>
                        {!window.kakao && <p style={{ fontSize: '0.8rem', color: '#ff9800' }}>* 카카오 개발자 설정에서<br />현재 주소를 추가했는지 다시 확인해 주세요.</p>}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '8px 20px', background: '#3b82f6', border: 'none',
                            borderRadius: '5px', color: '#fff', cursor: 'pointer'
                        }}
                    >
                        페이지 새로고침
                    </button>
                </div>
            )}
        </div>
    );
};

export default MapContainer;

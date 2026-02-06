import { useState, useEffect } from 'react';
import { Menu, User, UserCheck, ShieldCheck, Filter } from 'lucide-react';
import MapContainer from './components/MapContainer';
import BottomPanel from './components/BottomPanel';
import AiPredictionList from './components/AiPredictionList';
import MeasurementResultModal from './components/MeasurementResultModal';
import LoginModal from './components/LoginModal';
import AlertModal from './components/AlertModal';
import PlaceDetailModal from './components/PlaceDetailModal'; // Imported
import { useNoiseMeasure } from './hooks/useNoiseMeasure';
import { socket } from './services/socket'; // Explicit import to use emit

function App() {
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }
  const [introvertMode, setIntrovertMode] = useState(true);
  const [showAiList, setShowAiList] = useState(false);

  // Auth State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Custom Alert State
  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: 'success', // success, error, confirm
    message: '',
    onConfirm: null
  });

  const showAlert = (message, type = 'success') => {
    setAlertState({ isOpen: true, type, message, onConfirm: null });
  };

  const showConfirm = (message, onConfirm) => {
    setAlertState({ isOpen: true, type: 'confirm', message, onConfirm });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  // Measurement Result State
  const [resultDb, setResultDb] = useState(null); // null means no result to show
  const [showResultModal, setShowResultModal] = useState(false);

  // Community & Interaction State
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [currentReviews, setCurrentReviews] = useState([]);
  const [filterMode, setFilterMode] = useState('all'); // 'all' or 'quiet_only'

  // Custom Hook for Noise Measurement
  const { measuring, currentDb, startMeasurement, stopMeasurement } = useNoiseMeasure(userLocation, (finalDb) => {
    setResultDb(finalDb);
    setShowResultModal(true);
  });

  // AI Prediction Data State
  const [aiData, setAiData] = useState([]);

  // Mock AI Data Updater (Every 10 seconds)
  useEffect(() => {
    const generateMockData = () => {
      const places = ['스타벅스 강남점', '도서관', '중앙공원', '블루보틀', '커피빈'];
      const levels = ['여유', '보통', '시끄러움'];

      const newItem = {
        time: new Date().toLocaleTimeString(),
        place: places[Math.floor(Math.random() * places.length)],
        level: levels[Math.floor(Math.random() * levels.length)],
        accuracy: Math.floor(Math.random() * 20) + 80 // 80-99%
      };

      setAiData(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50
    };

    // Initial Data
    generateMockData();

    // Interval
    const interval = setInterval(generateMockData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Location Tracking
  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("User Location Updated:", latitude, longitude);
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
          if (error.code === 1) {
            showAlert("위치 권한이 거부되었습니다. 설정에서 허용해주세요.", "error");
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      // This alert is removed as per instruction's implied change
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Socket Listeners for Reviews
  useEffect(() => {
    socket.on('reviews_data', (reviews) => {
      setCurrentReviews(reviews);
    });

    socket.on('new_review', (review) => {
      // Only append if it belongs to currently selected marker
      if (selectedMarker && (selectedMarker.id === review.markerId || selectedMarker.timestamp === review.markerId)) {
        setCurrentReviews(prev => [review, ...prev]);
      }
    });

    return () => {
      socket.off('reviews_data');
      socket.off('new_review');
    };
  }, [selectedMarker]);

  const handleLogin = (adminStatus) => {
    setIsLoggedIn(true);
    setIsAdmin(adminStatus);
  };

  const handleLogout = () => {
    showConfirm("로그아웃 하시겠습니까?", () => {
      setIsLoggedIn(false);
      setIsAdmin(false);
      showAlert("로그아웃 되었습니다.", "success");
    });
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    setCurrentReviews([]); // Clear old
    // Fetch reviews
    socket.emit('get_reviews', marker.id || marker.timestamp);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* 1. Header Area */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 100,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        paddingBottom: '40px',
        pointerEvents: 'none'
      }}>
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '15px 20px', color: '#fff',
          pointerEvents: 'auto'
        }}>
          <Menu size={24} />
          <h1 style={{ fontSize: '1.1rem', fontWeight: '500', margin: 0 }}>Quietude Map (고요 지도)</h1>
          <div
            onClick={() => isLoggedIn ? handleLogout() : setShowLoginModal(true)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            {isAdmin ? <ShieldCheck size={24} color="#4ade80" /> : <User size={24} />}
            {isLoggedIn && <span style={{ fontSize: '0.8rem' }}>{isAdmin ? 'Admin' : 'User'}</span>}
          </div>
        </header>

        {/* 2. Top Banner Controls */}
        <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', marginTop: '10px', pointerEvents: 'auto' }}>

          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Filter Toggle */}
            <div
              onClick={() => setFilterMode(prev => prev === 'all' ? 'quiet_only' : 'all')}
              className="glass-panel"
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '8px 15px', borderRadius: '30px',
                background: filterMode === 'quiet_only' ? '#22c55e' : 'rgba(255, 255, 255, 0.15)',
                cursor: 'pointer', transition: '0.3s'
              }}
            >
              <Filter size={16} color="#fff" />
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>
                {filterMode === 'quiet_only' ? '조용한 곳만' : '전체 보기'}
              </span>
            </div>

            <div className="glass-panel" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 15px', borderRadius: '30px',
              background: 'rgba(255, 255, 255, 0.15)'
            }}>
              <UserCheck size={18} color="#fff" />
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>내향인 (Introvert-I)</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
            나만의 고요 존:
            <div
              onClick={() => setIntrovertMode(!introvertMode)}
              style={{
                width: '50px', height: '26px', background: introvertMode ? '#fff' : '#475569',
                borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'
              }}
            >
              <div style={{
                width: '22px', height: '22px', background: introvertMode ? '#334155' : '#fff',
                borderRadius: '50%', position: 'absolute', top: '2px',
                left: introvertMode ? '26px' : '2px', transition: '0.3s'
              }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Map) */}
      <main style={{ flex: 1, position: 'relative', zIndex: 0 }}>
        <MapContainer
          userLocation={userLocation}
          isAdmin={isAdmin}
          showConfirm={showConfirm}
          onMarkerClick={handleMarkerClick}
          filterMode={filterMode}
        />
      </main>

      {/* AI Prediction Modal */}
      <AiPredictionList
        isOpen={showAiList}
        onClose={() => setShowAiList(false)}
        data={aiData}
      />

      {/* Measurement Result Modal */}
      <MeasurementResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        db={resultDb}
      />

      {/* Place Detail & Review Modal */}
      <PlaceDetailModal
        isOpen={!!selectedMarker}
        onClose={() => setSelectedMarker(null)}
        markerData={selectedMarker}
        reviews={currentReviews}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        showAlert={showAlert}
      />

      {/* Global Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        type={alertState.type}
        message={alertState.message}
        onClose={closeAlert}
        onConfirm={alertState.onConfirm}
      />

      {/* 3. Bottom Panel Container - Always Visible */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: '100%', zIndex: 200,
        pointerEvents: 'auto'
      }}>

        {/* Measurement Trigger Button */}
        <div style={{
          marginBottom: '20px', display: 'flex', justifyContent: 'center'
        }}>
          <button
            onClick={measuring ? stopMeasurement : startMeasurement}
            className="glass-panel"
            style={{
              padding: '10px 20px', color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              background: measuring ? '#ef4444' : '#22c55e', // Red when measuring
              transition: '0.3s',
              boxShadow: measuring ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none'
            }}
          >
            {measuring ? '측정 종료' : '소음 측정 시작'}
          </button>
        </div>

        {/* The Bottom Panel Component */}
        <BottomPanel
          currentDb={currentDb}
          measuring={measuring}
          onOpenAiList={() => setShowAiList(true)}
          latestPrediction={aiData.length > 0 ? aiData[0] : null}
        />
      </div>

    </div>
  );
}

export default App;

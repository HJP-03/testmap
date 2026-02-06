import { useState, useRef, useEffect } from 'react';
import { socket } from '../services/socket';

const NoiseMeasurer = ({ userLocation }) => {
    const [measuring, setMeasuring] = useState(false);
    const [currentDb, setCurrentDb] = useState(0);
    const [resultDb, setResultDb] = useState(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const sourceRef = useRef(null);
    const intervalRef = useRef(null);

    const startMeasurement = async () => {
        try {
            setMeasuring(true);
            setResultDb(null);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;
            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            let readings = [];
            const startTime = Date.now();
            const DURATION = 4000; // 4 seconds

            intervalRef.current = setInterval(() => {
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);

                // Calculate RMS
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArrayRef.current[i] * dataArrayRef.current[i];
                }
                const rms = Math.sqrt(sum / bufferLength);

                // Convert to rough dB (0-100 scale approximation for web audio)
                // 128 is silence in byte freq? No, 0 is silence.
                // using simple formula: 20 * log10(rms / 255) * scale + offset
                // But for visualization, let's map 0-255 rms to 0-100 db roughly.
                // A full volume sine wave would be close to 100.
                let val = (rms / 255) * 100;

                // Enhance sensitivity for quiet room (0-10 usually)
                val = Math.max(0, val * 1.5); // Boost

                readings.push(val);
                setCurrentDb(Math.round(val));

                if (Date.now() - startTime > DURATION) {
                    finishMeasurement(readings, stream);
                }
            }, 100);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setMeasuring(false);
            alert("마이크 권한이 필요합니다.");
        }
    };

    const finishMeasurement = (readings, stream) => {
        clearInterval(intervalRef.current);

        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }

        // Calculate Average
        const sum = readings.reduce((a, b) => a + b, 0);
        let avg = sum / readings.length;

        // Logic: Human scream cap check (if > 80dB cap it)
        // Note: Our simple mapping might need calibration. 
        // Assuming 80 is loud cafe level in our scale.
        if (avg > 80) avg = 80;

        const finalValue = Math.round(avg);
        setResultDb(finalValue);
        setMeasuring(false);
        setCurrentDb(0);

        // Send to server
        // Add coordinates if available
        const payload = {
            timestamp: Date.now(),
            db: finalValue
        };

        if (userLocation) {
            payload.location = userLocation;
        }

        socket.emit('submit_noise_data', payload);
    };

    return (
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', margin: '20px' }}>
            <h3>현재 공간 소음 측정</h3>

            <div style={{ margin: '20px 0', fontSize: '2em', fontWeight: 'bold' }}>
                {measuring ? `${currentDb} dB` : resultDb !== null ? `${resultDb} dB` : '-- dB'}
            </div>

            <button
                className={`btn btn-measure ${measuring ? 'pulsing' : ''}`}
                onClick={measuring ? null : startMeasurement}
                disabled={measuring}
            >
                {measuring ? '측정 중...' : '소음 측정하기'}
            </button>

            {resultDb !== null && (
                <p style={{ marginTop: '10px', color: '#aaa' }}>
                    * 4초 평균값 (최대 80dB 제한)
                    {userLocation && <br />}
                    <span style={{ fontSize: '0.8em', color: '#4caf50' }}>[위치 정보 포함]</span>
                </p>
            )}
        </div>
    );
};

export default NoiseMeasurer;

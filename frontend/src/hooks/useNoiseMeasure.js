import { useState, useRef, useEffect } from 'react';
import { socket } from '../services/socket';

export const useNoiseMeasure = (userLocation, onComplete) => {
    const [measuring, setMeasuring] = useState(false);
    const [currentDb, setCurrentDb] = useState(0);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const sourceRef = useRef(null);
    const intervalRef = useRef(null);

    const startMeasurement = async () => {
        // Check if location is available
        if (!userLocation) {
            alert('위치 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.\n\n브라우저 설정에서 위치 권한을 허용했는지 확인해주세요.');
            return;
        }

        try {
            setMeasuring(true);
            setCurrentDb(0);

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
                if (!analyserRef.current) return;

                analyserRef.current.getByteFrequencyData(dataArrayRef.current);

                // Calculate RMS
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArrayRef.current[i] * dataArrayRef.current[i];
                }
                const rms = Math.sqrt(sum / bufferLength);

                // Approximate dB
                let val = (rms / 255) * 100;
                val = Math.max(0, val * 1.5); // Sensitivity boost

                readings.push(val);
                setCurrentDb(Math.round(val));

                if (Date.now() - startTime > DURATION) {
                    finishMeasurement(readings, stream);
                }
            }, 100);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setMeasuring(false);
            alert("마이크 권한이 필요합니다 (모바일의 경우 HTTPS 또는 로컬호스트 필요).");
        }
    };

    const finishMeasurement = (readings, stream) => {
        clearInterval(intervalRef.current);

        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        // Avg
        const sum = readings.reduce((a, b) => a + b, 0);
        let avg = sum / readings.length;
        if (avg > 80) avg = 80;

        const finalValue = Math.round(avg);
        setMeasuring(false);
        // Reset or keep? Let's keep it visible until next start
        setCurrentDb(finalValue);

        // Send to server
        const payload = {
            timestamp: Date.now(),
            db: finalValue
        };
        if (userLocation) payload.location = userLocation;

        console.log('Sending noise data to server:', payload);
        socket.emit('submit_noise_data', payload);
        console.log('Data emitted via socket.');

        // Trigger Callback instead of alert
        if (onComplete) onComplete(finalValue);
    };

    const stopMeasurement = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
        setMeasuring(false);
    };

    return { measuring, currentDb, startMeasurement, stopMeasurement };
};

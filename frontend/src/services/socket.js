import { io } from "socket.io-client";

// 배포 환경과 로컬 환경을 모두 지원하는 소켓 주소 설정
// 5173은 Vite 개발 서버 포트이며, 실배포 시에는 현재 도메인을 그대로 사용합니다.
const isDev = window.location.port === '5173';
const SOCKET_URL = isDev
    ? `https://${window.location.hostname}:5173` // 로컬 개발 시 Vite 프록시 경유
    : window.location.origin; // 실배포 시 (Render 등)

export const socket = io(SOCKET_URL, {
    autoConnect: true,
});

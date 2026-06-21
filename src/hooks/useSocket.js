import { useEffect, useRef } from "react";
import io from "socket.io-client";

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    socketRef.current = io(process.env.VITE_API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    return () => socketRef.current?.disconnect();
  }, []);

  return socketRef.current;
}

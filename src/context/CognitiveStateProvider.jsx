import React, { createContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTimer } from '../TimerContext';
import api from '../api/api';

export const CognitiveStateContext = createContext();

export function CognitiveStateProvider({ children }) {
    const [cognitiveState, setCognitiveState] = useState('flow');
    const [engineOutput, setEngineOutput] = useState(null);
    const [uiInteractions, setUiInteractions] = useState(0);
    const [idleMinutes, setIdleMinutes] = useState(0);
    const [contextSwitches, setContextSwitches] = useState(0);
    
    const lastInteractionTime = useRef(Date.now());
    const location = useLocation();
    const timerContext = useTimer();
    
    const timerRunning = timerContext?.activeTimer !== null && timerContext?.activeTimer !== undefined;
    const sessionDuration = timerContext?.sessionDurationMinutes || 0;
    const projectId = timerContext?.activeTimer?.projet_id || null;

    useEffect(() => {
        setContextSwitches(prev => prev + 1);
    }, [location.pathname]);

    useEffect(() => {
        const handleInteraction = () => {
            setUiInteractions(prev => prev + 1);
            lastInteractionTime.current = Date.now();
            setIdleMinutes(0);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        const idleInterval = setInterval(() => {
            const now = Date.now();
            setIdleMinutes((now - lastInteractionTime.current) / 60000);
        }, 60000);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            clearInterval(idleInterval);
        };
    }, []);

    // Sync raw metrics to backend and get computed state back
    useEffect(() => {
        const syncMetrics = async () => {
            try {
                const res = await api.post('/cognitive/events', {
                    sessionDuration,
                    contextSwitches,
                    timerRunning,
                    idleTime: idleMinutes,
                    uiInteractions,
                    projectId
                });

                if (res.data?.event?.state) {
                    setCognitiveState(res.data.event.state);
                    setEngineOutput(res.data.event);
                } else if (res.data?.message === 'État inchangé') {
                    // State unchanged, all good
                }
            } catch (err) {
                console.error("Erreur sync état cognitif:", err);
            }
        };

        const debounce = setTimeout(syncMetrics, 5000); // Sync every 5s if metrics change
        return () => clearTimeout(debounce);
    }, [sessionDuration, contextSwitches, timerRunning, idleMinutes, uiInteractions, projectId]);

    const value = {
        cognitiveState,
        engineOutput
    };

    return (
        <CognitiveStateContext.Provider value={value}>
            {children}
        </CognitiveStateContext.Provider>
    );
}

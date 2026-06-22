import { useContext } from 'react';
import { CognitiveStateContext } from '../context/CognitiveStateProvider';

export function useCognitiveState() {
    const context = useContext(CognitiveStateContext);
    if (!context) {
        throw new Error('useCognitiveState must be used within a CognitiveStateProvider');
    }
    return context;
}

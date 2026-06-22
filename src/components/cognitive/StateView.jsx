import React from 'react';
import { useCognitiveState } from '../../hooks/useCognitiveState';

export default function StateView() {
    const { cognitiveState } = useCognitiveState();

    const stateColors = {
        'flow': 'text-green-500',
        'deep_focus': 'text-purple-500',
        'friction': 'text-yellow-500',
        'fatigue': 'text-red-500'
    };

    return (
        <div className="p-4 rounded-lg bg-gray-800 shadow-sm border border-gray-700 flex items-center justify-between">
            <span className="text-gray-300 font-medium">État Cognitif Actuel</span>
            <span className={`font-bold capitalize ${stateColors[cognitiveState] || 'text-gray-400'}`}>
                {cognitiveState.replace('_', ' ')}
            </span>
        </div>
    );
}

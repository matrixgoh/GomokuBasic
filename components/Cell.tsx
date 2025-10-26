
import React from 'react';
import { Player } from '../types';

interface CellProps {
    value: Player;
    onClick: () => void;
    isWinner: boolean;
    isAITurn: boolean;
}

const Cell: React.FC<CellProps> = React.memo(({ value, onClick, isWinner, isAITurn }) => {
    
    const hoverClass = !value && !isAITurn ? 'hover:bg-black/10' : '';
    const cursorClass = !value && !isAITurn ? 'cursor-pointer' : 'cursor-default';
    
    const cellBaseStyle = 'aspect-square flex items-center justify-center relative transition-colors duration-200';
    
    // Stone styling
    const stoneBaseStyle = 'w-[85%] h-[85%] rounded-full transition-transform duration-300 transform shadow-lg';
    const stoneVisibleStyle = value ? 'scale-100' : 'scale-0';
    
    let stoneSpecificStyle = '';
    if (value === 'X') { // Black stone
        stoneSpecificStyle = 'bg-gradient-to-br from-gray-700 via-black to-gray-800 border-2 border-gray-900';
    } else if (value === 'O') { // White stone
        stoneSpecificStyle = 'bg-gradient-to-br from-white to-gray-300 border-2 border-gray-400';
    }

    const winnerPulse = isWinner ? 'animate-pulse ring-4 ring-green-500/70' : '';

    return (
        <div
            className={`${cellBaseStyle} ${hoverClass} ${cursorClass}`}
            onClick={onClick}
            role="button"
            aria-label={`Board cell. ${value ? `Contains ${value === 'X' ? 'black' : 'white'} stone.` : 'Empty.'}`}
        >
            <div className={`${stoneBaseStyle} ${stoneVisibleStyle} ${stoneSpecificStyle} ${winnerPulse}`} />
        </div>
    );
});

export default Cell;

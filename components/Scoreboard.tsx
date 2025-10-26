import React from 'react';
import { GameOptions, PlayerType } from '../types';

interface ScoreboardProps {
    scores: { X: number; O: number };
    gameOptions: GameOptions;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ scores, gameOptions }) => {
    const getPlayerLabel = (playerType: PlayerType) => {
        switch (playerType) {
            case 'human': return '(Human)';
            case 'classic': return '(Classic AI)';
            case 'gemini': return '(Gemini AI)';
            default: return '';
        }
    };

    return (
        <div className="flex justify-between text-lg font-bold text-gray-700 mb-4 px-2">
            <div className="flex items-center space-x-2">
                <span className="text-gray-800">Black {getPlayerLabel(gameOptions.playerX)}:</span>
                <span className="text-2xl text-gray-900">{scores.X}</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-gray-600">White {getPlayerLabel(gameOptions.playerO)}:</span>
                 <span className="text-2xl text-gray-900">{scores.O}</span>
            </div>
        </div>
    );
};

export default Scoreboard;

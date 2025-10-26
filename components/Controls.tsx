import React from 'react';
import { GameOptions, PlayerType } from '../types';

interface ControlsProps {
    onRestart: () => void;
    gameOptions: GameOptions;
    onGameOptionsChange: (newOptions: GameOptions) => void;
    isGameOver: boolean;
}

const PlayerControl: React.FC<{
    label: string;
    playerKey: keyof GameOptions;
    currentValue: PlayerType;
    onChange: (playerKey: keyof GameOptions, value: PlayerType) => void;
}> = ({ label, playerKey, currentValue, onChange }) => {
    const options: PlayerType[] = ['human', 'classic', 'gemini'];
    const optionLabels = {
        human: 'Human',
        classic: 'Classic AI',
        gemini: 'Gemini AI'
    };

    return (
        <div>
            <h3 className="font-semibold text-gray-700 mb-2 text-center">{label}</h3>
            <div className="flex justify-center rounded-lg shadow-sm" role="group">
                {options.map((option, index) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(playerKey, option)}
                        className={`py-2 px-4 text-sm font-medium transition-colors duration-200 focus:z-10 focus:ring-2 focus:ring-blue-500
                            ${index === 0 ? 'rounded-l-lg' : ''}
                            ${index === options.length - 1 ? 'rounded-r-lg' : ''}
                            ${currentValue === option
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-900 hover:bg-gray-100'
                            }
                            border border-gray-200`}
                    >
                        {optionLabels[option]}
                    </button>
                ))}
            </div>
        </div>
    );
};


const Controls: React.FC<ControlsProps> = ({ onRestart, gameOptions, onGameOptionsChange, isGameOver }) => {
    
    const handlePlayerChange = (playerKey: keyof GameOptions, value: PlayerType) => {
        onGameOptionsChange({
            ...gameOptions,
            [playerKey]: value,
        });
    };

    return (
        <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-100 rounded-lg">
                <PlayerControl
                    label="Black (X) Player"
                    playerKey="playerX"
                    currentValue={gameOptions.playerX}
                    onChange={handlePlayerChange}
                />
                 <PlayerControl
                    label="White (O) Player"
                    playerKey="playerO"
                    currentValue={gameOptions.playerO}
                    onChange={handlePlayerChange}
                />
            </div>
            <button
                onClick={onRestart}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
            >
                {isGameOver ? 'New Game' : 'Restart Game'}
            </button>
        </div>
    );
};

export default Controls;

import React from 'react';
import { BoardState } from '../types';
import Cell from './Cell';

interface GameBoardProps {
    board: BoardState;
    onCellClick: (index: number) => void;
    winningLine: number[];
    size: number;
    isAITurn: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onCellClick, winningLine, size, isAITurn }) => {
    
    const boardStyle: React.CSSProperties = {
        backgroundColor: '#DDB88C', // Wood color
        // Draw grid lines that align with the center of the cells
        backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.2) 1px, transparent 1px)
        `,
        backgroundSize: `calc(100% / ${size}) calc(100% / ${size})`,
        // Offset the grid to appear between cells
        backgroundPosition: `calc(100% / (${size} * 2)) calc(100% / (${size} * 2))`,
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
    };

    return (
        <div style={boardStyle} className="border-4 border-gray-800 shadow-lg aspect-square">
            {board.map((cell, index) => (
                <Cell
                    key={index}
                    value={cell}
                    onClick={() => onCellClick(index)}
                    isWinner={winningLine.includes(index)}
                    isAITurn={isAITurn}
                />
            ))}
        </div>
    );
};

export default GameBoard;

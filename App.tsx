import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BoardState, Player, GameOptions, PlayerType, ActivePlayer } from './types';
import { getAIMove } from './services/geminiService';
import { getClassicAIMove } from './services/classicAiService';
import { generateWinningConditions } from './utils/gameUtils';
import GameBoard from './components/GameBoard';
import Scoreboard from './components/Scoreboard';
import StatusDisplay from './components/StatusDisplay';
import Controls from './components/Controls';
import { useGameSounds } from './hooks/useGameSounds';

const App: React.FC = () => {
    const [boardSize] = useState(15);
    const [gameState, setGameState] = useState<BoardState>(Array(boardSize * boardSize).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
    const [isGameActive, setIsGameActive] = useState(true);
    const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
    const [winningLine, setWinningLine] = useState<number[]>([]);
    const [scores, setScores] = useState({ X: 0, O: 0 });
    const [gameOptions, setGameOptions] = useState<GameOptions>({ playerX: 'human', playerO: 'gemini' });
    const [isAiThinking, setIsAiThinking] = useState(false);
    const { initializeSounds, playMoveSound, playWinSound, playDrawSound } = useGameSounds();

    const winConditionLength = 5;
    const winningConditions = useMemo(() => generateWinningConditions(boardSize, winConditionLength), [boardSize, winConditionLength]);
    const [statusMessage, setStatusMessage] = useState("Black's turn to start");

    const checkWinner = useCallback((currentGameState: BoardState) => {
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            const firstCell = currentGameState[winCondition[0]];
            if (firstCell && winCondition.every(index => currentGameState[index] === firstCell)) {
                setWinner(firstCell);
                setWinningLine(winCondition);
                setIsGameActive(false);
                setScores(prev => ({ ...prev, [firstCell]: prev[firstCell] + 1 }));
                playWinSound();
                return true; // Winner found
            }
        }

        if (!currentGameState.includes(null)) {
            setWinner('Draw');
            setIsGameActive(false);
            playDrawSound();
            return true; // Draw
        }
        return false; // No winner yet
    }, [winningConditions, playWinSound, playDrawSound]);

    const isHumanTurn = (player: Player) => {
        if (!player) return false;
        return player === 'X' ? gameOptions.playerX === 'human' : gameOptions.playerO === 'human';
    }

    const handleCellClick = (index: number) => {
        if (gameState[index] || !isGameActive || winner || !isHumanTurn(currentPlayer)) return;
        
        initializeSounds();

        const newGameState = [...gameState];
        newGameState[index] = currentPlayer;
        setGameState(newGameState);
        playMoveSound(currentPlayer);

        const gameHasEnded = checkWinner(newGameState);
        if (!gameHasEnded) {
            setCurrentPlayer(prev => prev === 'X' ? 'O' : 'X');
        }
    };
    
    const handleRestart = useCallback(() => {
        setGameState(Array(boardSize * boardSize).fill(null));
        setCurrentPlayer('X');
        setIsGameActive(true);
        setWinner(null);
        setWinningLine([]);
        setStatusMessage("Black's turn to start");
    }, [boardSize]);
    
    const handleGameOptionsChange = (newOptions: GameOptions) => {
        setGameOptions(newOptions);
        handleRestart();
    };


    useEffect(() => {
        let message = "";
        const getPlayerTypeLabel = (playerType: PlayerType) => {
            switch(playerType) {
                case 'human': return 'Human';
                case 'classic': return 'Classic AI';
                case 'gemini': return 'Gemini AI';
                default: return '';
            }
        }

        if (!isGameActive && winner) {
            if (winner === 'Draw') {
                message = "It's a draw!";
            } else {
                const winnerName = winner === 'X' ? 'Black' : 'White';
                const winnerType = winner === 'X' ? gameOptions.playerX : gameOptions.playerO;
                message = `${winnerName} (${getPlayerTypeLabel(winnerType)}) has won!`;
            }
        } else if (isAiThinking) {
            const aiPlayer = currentPlayer === 'X' ? gameOptions.playerX : gameOptions.playerO;
            message = `${getPlayerTypeLabel(aiPlayer)} is thinking...`;
        } else if (isGameActive) {
            if (statusMessage.startsWith('AI:')) {
                message = statusMessage;
             } else {
                const turnName = currentPlayer === 'X' ? 'Black' : 'White';
                const playerType = currentPlayer === 'X' ? gameOptions.playerX : gameOptions.playerO;
                message = `${turnName}'s turn (${getPlayerTypeLabel(playerType)})`;
             }
        }
        
        setStatusMessage(message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPlayer, isGameActive, winner, isAiThinking, gameOptions]);


    useEffect(() => {
        const currentPlayerType = currentPlayer === 'X' ? gameOptions.playerX : gameOptions.playerO;
        if (currentPlayerType === 'human' || !isGameActive || winner) return;

        setIsAiThinking(true);
        
        const performAiMove = async () => {
            let aiResult: { move: { row: number, col: number }, thought?: string } | null = null;
            
            if (currentPlayerType === 'gemini') {
                aiResult = await getAIMove(gameState, boardSize, currentPlayer as ActivePlayer);
            } else { // 'classic'
                // Add a small delay for a more natural feel
                await new Promise(resolve => setTimeout(resolve, 400));
                aiResult = getClassicAIMove(gameState, boardSize, currentPlayer as ActivePlayer);
            }

            if (aiResult && aiResult.move !== undefined) {
                const { move, thought } = aiResult;
                
                if (thought) {
                    setStatusMessage(`AI: "${thought}"`);
                }
                
                // Add a slight delay after thought is displayed
                setTimeout(() => {
                    const index = move.row * boardSize + move.col;
                    if (gameState[index] === null) {
                        const newGameState = [...gameState];
                        newGameState[index] = currentPlayer;
                        setGameState(newGameState);
                        playMoveSound(currentPlayer);

                        const gameHasEnded = checkWinner(newGameState);
                        if (!gameHasEnded) {
                           setCurrentPlayer(prev => prev === 'X' ? 'O' : 'X');
                        }
                    } else {
                        console.error("AI chose an occupied cell.", move);
                        // If AI fails, don't stall the game, just switch players
                        setCurrentPlayer(prev => prev === 'X' ? 'O' : 'X');
                    }
                    setIsAiThinking(false);
                }, thought ? 400 : 0);

            } else {
                console.error("AI failed to return a valid move. Switching turn.");
                setCurrentPlayer(prev => prev === 'X' ? 'O' : 'X');
                setIsAiThinking(false);
            }
        };
        performAiMove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPlayer, isGameActive, winner, gameState]);

    const isCurrentPlayerAI = (currentPlayer === 'X' && gameOptions.playerX !== 'human') || (currentPlayer === 'O' && gameOptions.playerO !== 'human');

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl w-full max-w-3xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-black text-center text-gray-800 mb-2">
                    Gomoku: Gemini vs Classic AI
                </h1>

                <Scoreboard scores={scores} gameOptions={gameOptions} />
                <StatusDisplay message={statusMessage} />

                <GameBoard
                    board={gameState}
                    onCellClick={handleCellClick}
                    winningLine={winningLine}
                    size={boardSize}
                    isAITurn={isCurrentPlayerAI}
                />
                
                <Controls 
                    onRestart={handleRestart}
                    gameOptions={gameOptions}
                    onGameOptionsChange={handleGameOptionsChange}
                    isGameOver={!isGameActive || !!winner}
                />
            </div>
        </div>
    );
};

export default App;

import { BoardState, ActivePlayer } from '../types';

interface AIResponse {
    move: { row: number, col: number };
    thought: string;
}

export const getAIMove = async (board: BoardState, size: number, aiPlayer: ActivePlayer): Promise<AIResponse | null> => {
    try {
        const response = await fetch('/api/getGeminiMove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                board,
                size,
                aiPlayer
            })
        });

        if (!response.ok) {
            console.error("API request failed:", response.status, response.statusText);
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.move && typeof data.move.row === 'number' && typeof data.move.col === 'number') {
            return {
                move: {
                    row: data.move.row,
                    col: data.move.col,
                },
                thought: data.thought || "A strategic move."
            };
        }

    } catch (error) {
        console.error("Error getting AI move from Gemini API:", error);
    }
    
    // Fallback logic if API fails or returns invalid data
    console.log("Gemini API failed or returned invalid move, using fallback logic.");
    const availableMoves = board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
    if (availableMoves.length > 0) {
        const randomIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        return {
            move: {
                row: Math.floor(randomIndex / size),
                col: randomIndex % size
            },
            thought: "I had a momentary lapse of judgment and chose a random spot."
        };
    }

    return null;
};

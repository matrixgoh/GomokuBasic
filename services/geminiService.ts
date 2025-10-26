import { GoogleGenAI, Type } from "@google/genai";
import { BoardState, ActivePlayer } from '../types';

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface AIResponse {
    move: { row: number, col: number };
    thought: string;
}

function boardToString(board: BoardState, size: number): string {
    let boardString = '';
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = board[r * size + c];
            boardString += cell === null ? '.' : cell;
        }
        boardString += '\n';
    }
    return boardString.trim();
}

export const getAIMove = async (board: BoardState, size: number, aiPlayer: ActivePlayer): Promise<AIResponse | null> => {
    const model = 'gemini-2.5-flash';

    const boardString = boardToString(board, size);
    const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

    const systemInstruction = `You are a world-class Gomoku (Five in a Row) AI.
The game is played on a 15x15 board. The goal is to get exactly five of your pieces in a row (horizontally, vertically, or diagonally).
You are playing as '${aiPlayer}'. The human player is '${humanPlayer}'.
The board is represented as a 15x15 grid. '.' represents an empty cell.
Analyze the board and provide your best move. Your top priorities are:
1. If you have a move that creates a 5-in-a-row, take it to win.
2. If the opponent ('${humanPlayer}') has a 4-in-a-row that is not blocked, you MUST block it.
3. If the opponent has an open "three" that could become an unblockable "four", you should strongly consider blocking it.
4. Look for opportunities to create your own threats, especially "open fours" or multiple "threes".
Provide your response in JSON format. The JSON object must contain the move's 0-indexed 'row', 'col', and a brief 'thought' process explaining your strategic choice.`;
    
    const contents = `Current board state:
${boardString}

You are player '${aiPlayer}'. What is your next move?`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        row: { type: Type.INTEGER, description: "The 0-indexed row for the move." },
                        col: { type: Type.INTEGER, description: "The 0-indexed column for the move." },
                        thought: { type: Type.STRING, description: "Your reasoning for the move." },
                    },
                    required: ['row', 'col', 'thought'],
                },
                temperature: 0.7,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (parsedResponse && typeof parsedResponse.row === 'number' && typeof parsedResponse.col === 'number') {
            // Validate the move before returning
            if (
                parsedResponse.row >= 0 && parsedResponse.row < size &&
                parsedResponse.col >= 0 && parsedResponse.col < size &&
                board[parsedResponse.row * size + parsedResponse.col] === null
            ) {
                 return {
                    move: {
                        row: parsedResponse.row,
                        col: parsedResponse.col,
                    },
                    thought: parsedResponse.thought || "A strategic move."
                };
            } else {
                console.error("Gemini proposed an invalid move (out of bounds or on an occupied cell):", parsedResponse);
            }
        }

    } catch (error) {
        console.error("Error getting AI move from Gemini:", error);
    }
    
    // Fallback logic if API fails or returns invalid data
    console.log("Gemini failed or returned invalid move, using fallback logic.");
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

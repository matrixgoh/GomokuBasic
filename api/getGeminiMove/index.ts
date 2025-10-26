import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { GoogleGenAI, Type } from "@google/genai";

type Player = 'X' | 'O' | null;
type BoardState = Player[];
type ActivePlayer = 'X' | 'O';

interface AIResponse {
    move: { row: number, col: number };
    thought: string;
}

interface RequestBody {
    board: BoardState;
    size: number;
    aiPlayer: ActivePlayer;
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

export async function getGeminiMove(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const body = await request.json() as RequestBody;
        const { board, size, aiPlayer } = body;

        if (!board || !size || !aiPlayer) {
            return {
                status: 400,
                jsonBody: { error: "Missing required parameters: board, size, aiPlayer" }
            };
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            context.error("GEMINI_API_KEY environment variable is not set");
            return {
                status: 500,
                jsonBody: { error: "API key not configured" }
            };
        }

        const ai = new GoogleGenAI({ apiKey });
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
                const result: AIResponse = {
                    move: {
                        row: parsedResponse.row,
                        col: parsedResponse.col,
                    },
                    thought: parsedResponse.thought || "A strategic move."
                };
                return {
                    status: 200,
                    jsonBody: result
                };
            } else {
                context.error("Gemini proposed an invalid move (out of bounds or on an occupied cell):", parsedResponse);
                return {
                    status: 400,
                    jsonBody: { error: "Invalid move from AI" }
                };
            }
        }

        return {
            status: 500,
            jsonBody: { error: "Failed to get valid move from AI" }
        };

    } catch (error) {
        context.error("Error getting AI move from Gemini:", error);
        return {
            status: 500,
            jsonBody: { error: "Internal server error", message: error.message }
        };
    }
}

app.http('getGeminiMove', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: getGeminiMove
});

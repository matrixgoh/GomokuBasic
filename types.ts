export type Player = 'X' | 'O' | null;
export type ActivePlayer = 'X' | 'O';

export type PlayerType = 'human' | 'classic' | 'gemini';

export interface GameOptions {
    playerX: PlayerType;
    playerO: PlayerType;
}

export type BoardState = Player[];

import { BoardState, ActivePlayer } from '../types';

/**
 * Checks if a cell at a given index has any adjacent occupied cells.
 * This is used to narrow down the number of moves to evaluate.
 */
const hasNeighbor = (index: number, board: BoardState, size: number): boolean => {
    const r = Math.floor(index / size);
    const c = index % size;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr * size + nc] !== null) {
                return true;
            }
        }
    }
    return false;
};

/**
 * Checks if two indices are on the same line given a direction.
 * Prevents lines from "wrapping" around the board.
 */
const isSameLine = (idx1: number, idx2: number, dir: number, size: number): boolean => {
    if (idx1 < 0 || idx1 >= size * size || idx2 < 0 || idx2 >= size * size) return false;
    const r1 = Math.floor(idx1 / size);
    const c1 = idx1 % size;
    const r2 = Math.floor(idx2 / size);
    const c2 = idx2 % size;

    if (dir === 1) return r1 === r2; // Horizontal
    if (dir === size) return c1 === c2; // Vertical
    if (dir === size + 1) return r1 - c1 === r2 - c2; // Diagonal \
    if (dir === size - 1) return r1 + c1 === r2 + c2; // Diagonal /
    return false;
};

/**
 * Calculates a score for a potential move by evaluating the longest line of consecutive
 * pieces that would be formed.
 */
const getScoreForMove = (index: number, player: ActivePlayer, board: BoardState, size: number): number => {
    const tempBoard = [...board];
    tempBoard[index] = player;
    const directions = [1, size, size + 1, size - 1]; // H, V, D\, D/
    let maxScore = 0;

    for (const dir of directions) {
        let consecutive = 0;
        // Count backwards from index
        for (let i = 1; i < 5; i++) {
            const checkIndex = index - i * dir;
            if (isSameLine(index, checkIndex, dir, size) && tempBoard[checkIndex] === player) {
                consecutive++;
            } else {
                break;
            }
        }
        // Count forwards from index (includes the piece at index itself)
        for (let i = 0; i < 5; i++) {
            const checkIndex = index + i * dir;
            if (isSameLine(index, checkIndex, dir, size) && tempBoard[checkIndex] === player) {
                consecutive++;
            } else {
                break;
            }
        }
        // Score based on consecutive pieces (e.g., 2->100, 3->1000, 4->10000, 5->100000)
        const score = Math.pow(10, consecutive);
        if (score > maxScore) {
            maxScore = score;
        }
    }
    return maxScore;
};

export const getClassicAIMove = (board: BoardState, size: number, aiPlayer: ActivePlayer): { move: { row: number, col: number }, thought: string } => {
    const opponent = aiPlayer === 'X' ? 'O' : 'X';
    let bestMove = { index: -1, score: -1 };

    const emptyCells = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            // To optimize, only consider cells adjacent to existing pieces
            if (hasNeighbor(i, board, size)) {
                emptyCells.push(i);
            }
        }
    }

    // If no neighbors (first move), play in the center
    if (emptyCells.length === 0 && board.every(c => c === null)) {
        const center = Math.floor(size * size / 2);
        return {
            move: { row: Math.floor(center / size), col: center % size },
            thought: "A classic opening move."
        };
    }

    for (const index of emptyCells) {
        const offensiveScore = getScoreForMove(index, aiPlayer, board, size);
        const defensiveScore = getScoreForMove(index, opponent, board, size);
        
        // Prioritize the most critical move, slightly favoring offense.
        const currentScore = offensiveScore + defensiveScore * 0.9;

        if (currentScore > bestMove.score) {
            bestMove = { index, score: currentScore };
        }
    }

    // Fallback if no valid neighboring moves are found
    if (bestMove.index === -1) {
        const availableMoves = board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
        const fallbackIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        bestMove.index = fallbackIndex;
    }

    return {
        move: {
            row: Math.floor(bestMove.index / size),
            col: bestMove.index % size,
        },
        thought: "A calculated move based on board heuristics."
    };
};

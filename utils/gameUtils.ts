
/**
 * Dynamically generates winning conditions for a square board.
 * @param {number} size - The size of the board (e.g., 3 for 3x3).
 * @param {number} inARow - The number of pieces needed to win (e.g., 3 for 3x3, 5 for 6x6).
 * @returns {number[][]} An array of winning condition arrays.
 */
export function generateWinningConditions(size: number, inARow: number): number[][] {
    const conditions: number[][] = [];
    
    // Rows
    for (let r = 0; r < size; r++) {
        for (let c = 0; c <= size - inARow; c++) {
            const row: number[] = [];
            for (let i = 0; i < inARow; i++) { row.push(r * size + c + i); }
            conditions.push(row);
        }
    }
    
    // Columns
    for (let c = 0; c < size; c++) {
        for (let r = 0; r <= size - inARow; r++) {
            const col: number[] = [];
            for (let i = 0; i < inARow; i++) { col.push((r + i) * size + c); }
            conditions.push(col);
        }
    }
    
    // Diagonal (top-left to bottom-right)
    for (let r = 0; r <= size - inARow; r++) {
        for (let c = 0; c <= size - inARow; c++) {
            const diag: number[] = [];
            for (let i = 0; i < inARow; i++) { diag.push((r + i) * size + (c + i)); }
            conditions.push(diag);
        }
    }
    
    // Diagonal (top-right to bottom-left)
    for (let r = 0; r <= size - inARow; r++) {
        for (let c = size - 1; c >= inARow - 1; c--) {
            const diag: number[] = [];
            for (let i = 0; i < inARow; i++) { diag.push((r + i) * size + (c - i)); }
            conditions.push(diag);
        }
    }
    
    return conditions;
}

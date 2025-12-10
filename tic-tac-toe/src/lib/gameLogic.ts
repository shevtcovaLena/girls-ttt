/**
 * Game Logic for Tic-Tac-Toe
 * 
 * This module contains all core game logic including board management,
 * winner detection, move validation, and AI opponent strategy.
 * 
 * The AI uses a balanced approach: 40% случайных ходов, но всегда побеждает себя
 * и иногда блокирует игрока. Это создаёт вызов, но не делает игру невозможной.
 */


/**
 * Represents a single cell on the board.
 * null = empty, 'X' = player, 'O' = computer
 */
export type Cell = null | 'X' | 'O';


/**
 * Represents the game board as a 9-element array.
 * Indices map to positions:
 * 0 | 1 | 2
 * ---------
 * 3 | 4 | 5
 * ---------
 * 6 | 7 | 8
 */
export type Board = [
  Cell, Cell, Cell,
  Cell, Cell, Cell,
  Cell, Cell, Cell
];


/**
 * Represents a player in the game.
 */
export type Player = 'X' | 'O';


/**
 * All possible winning combinations (8 total):
 * - 3 rows (horizontal)
 * - 3 columns (vertical)
 * - 2 diagonals
 */
const WINNING_COMBINATIONS: readonly number[][] = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
] as const;


/**
 * Initializes an empty game board.
 * 
 * @returns A new board with all cells set to null
 * 
 * @example
 * const board = initializeBoard();
 * // Returns: [null, null, null, null, null, null, null, null, null]
 */
export function initializeBoard(): Board {
  return [null, null, null, null, null, null, null, null, null];
}


/**
 * Checks if a player has won the game by examining all winning combinations.
 * 
 * @param board - The current game board state
 * @returns 'X' if player won, 'O' if computer won, null if no winner yet
 * 
 * @example
 * // Player wins horizontally (top row)
 * const board: Board = ['X', 'X', 'X', null, 'O', null, null, null, null];
 * calculateWinner(board); // Returns: 'X'
 * 
 * @example
 * // Computer wins diagonally
 * const board: Board = ['O', 'X', null, 'X', 'O', null, null, null, 'O'];
 * calculateWinner(board); // Returns: 'O'
 * 
 * @example
 * // No winner yet
 * const board: Board = ['X', 'O', 'X', 'O', 'X', null, null, null, null];
 * calculateWinner(board); // Returns: null
 */
export function calculateWinner(board: Board): 'X' | 'O' | null {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    const cellA = board[a];
    const cellB = board[b];
    const cellC = board[c];

    // Check if all three cells in this combination are the same and not null
    if (cellA !== null && cellA === cellB && cellB === cellC) {
      return cellA;
    }
  }

  return null;
}


/**
 * Checks if the board is completely filled (draw condition).
 * 
 * @param board - The current game board state
 * @returns true if all 9 cells are filled, false otherwise
 * 
 * @example
 * const board: Board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
 * isBoardFull(board); // Returns: true
 * 
 * @example
 * const board: Board = ['X', 'O', null, 'O', 'X', 'O', 'O', 'X', 'O'];
 * isBoardFull(board); // Returns: false
 */
export function isBoardFull(board: Board): boolean {
  return board.every(cell => cell !== null);
}


/**
 * Validates if a move is legal at the given index.
 * 
 * @param board - The current game board state
 * @param index - The cell index (0-8) to check
 * @returns true if index is valid (0-8) and cell is empty, false otherwise
 * 
 * @example
 * const board: Board = ['X', null, 'O', null, null, null, null, null, null];
 * isValidMove(board, 1); // Returns: true (cell is empty)
 * isValidMove(board, 0); // Returns: false (cell is occupied)
 * isValidMove(board, 9); // Returns: false (invalid index)
 */
export function isValidMove(board: Board, index: number): boolean {
  // Check if index is within valid range
  if (index < 0 || index >= 9) {
    return false;
  }

  // Check if cell is empty
  return board[index] === null;
}


/**
 * Finds the best move for the computer using a balanced AI approach.
 * 
 * Strategy:
 * 1. 40% шанс: компьютер делает просто случайный ход (даёт игроку шанс выиграть)
 * 2. 60% шанс: компьютер играет умно:
 *    - Если компьютер может выиграть на следующем ходе, побеждает
 *    - Если игрок может выиграть на следующем ходе, блокирует
 *    - Иначе случайный ход из доступных
 * 
 * Этот подход создаёт баланс между вызовом и доступностью победы.
 * 
 * @param board - The current game board state
 * @returns The index (0-8) of the cell to play, or -1 if board is full
 * 
 * @example
 * // Компьютер может выиграть, и вероятно это сделает
 * const board: Board = ['O', 'O', null, 'X', 'X', null, null, null, null];
 * getComputerMove(board); // Returns: 2 (высокий шанс выигрыша, но может быть случайный ход)
 * 
 * @example
 * // Компьютер обычно блокирует, но 40% может забить
 * const board: Board = ['X', 'X', null, 'O', null, null, null, null, null];
 * getComputerMove(board); // Returns: 2 или случайный ход (60% блокировка, 40% рандом)
 */
export function getComputerMove(board: Board): number {
  // 40% шанс на случайный ход - это делает игру не скучной и даёт игроку возможность выиграть
  if (Math.random() < 0.4) {
    const availableMoves = board
      .map((cell, index) => (cell === null ? index : -1))
      .filter(index => index !== -1);
    
    if (availableMoves.length > 0) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
  }

  // 60% случаев: умная игра
  // Стратегия 1: проверить, может ли компьютер выиграть на следующем ходе
  const winningMove = findWinningMove(board, 'O');
  if (winningMove !== -1) {
    return winningMove;
  }

  // Стратегия 2: блокировать игрока если она может выиграть
  const blockingMove = findWinningMove(board, 'X');
  if (blockingMove !== -1) {
    return blockingMove;
  }

  // Стратегия 3: взять случайный доступный ход
  const availableMoves = board
    .map((cell, index) => (cell === null ? index : -1))
    .filter(index => index !== -1);

  if (availableMoves.length > 0) {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  // Board is full (shouldn't happen in normal gameplay)
  return -1;
}


/**
 * Helper function to find a winning move for a given player.
 * Checks all winning combinations to see if the player can complete one.
 * 
 * Логика: если у игрока уже 2 символа в одной комбинации и 1 клетка пуста,
 * это выигрышный ход.
 * 
 * @param board - The current game board state
 * @param player - The player to check for ('X' or 'O')
 * @returns The index of the winning move, or -1 if no winning move exists
 * 
 * @private
 */
function findWinningMove(board: Board, player: Player): number {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    const cellA = board[a];
    const cellB = board[b];
    const cellC = board[c];

    // Count how many cells in this combination belong to the player
    const playerCells = [cellA, cellB, cellC].filter(cell => cell === player).length;
    const emptyCells = [cellA, cellB, cellC].filter(cell => cell === null).length;

    // If player has 2 cells and 1 is empty, this is a winning move
    if (playerCells === 2 && emptyCells === 1) {
      // Find which cell is empty
      if (cellA === null) return a;
      if (cellB === null) return b;
      if (cellC === null) return c;
    }
  }

  return -1;
}

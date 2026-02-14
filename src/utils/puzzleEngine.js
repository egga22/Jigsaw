/**
 * Core puzzle engine: generates pieces, handles snapping, and checks completion.
 */

/**
 * Generate jigsaw puzzle piece definitions.
 * Each piece has: id, row, col, correctX, correctY, currentX, currentY, width, height, isPlaced
 *
 * @param {number} cols - Number of columns
 * @param {number} rows - Number of rows
 * @param {number} imageWidth - Total image width
 * @param {number} imageHeight - Total image height
 * @returns {Array} Array of piece objects
 */
export function generatePieces(cols, rows, imageWidth, imageHeight) {
  const pieceW = imageWidth / cols;
  const pieceH = imageHeight / rows;
  const pieces = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      pieces.push({
        id: row * cols + col,
        row,
        col,
        correctX: col * pieceW,
        correctY: row * pieceH,
        currentX: 0,
        currentY: 0,
        width: pieceW,
        height: pieceH,
        isPlaced: false,
      });
    }
  }

  return pieces;
}

/**
 * Shuffle pieces to random positions within a given area.
 *
 * @param {Array} pieces - Array of piece objects
 * @param {number} areaWidth - Available width for scattering
 * @param {number} areaHeight - Available height for scattering
 * @param {number} pieceW - Piece width
 * @param {number} pieceH - Piece height
 * @returns {Array} Shuffled pieces with randomized currentX/currentY
 */
export function shufflePieces(pieces, areaWidth, areaHeight, pieceW, pieceH) {
  return pieces.map((piece) => ({
    ...piece,
    currentX: Math.random() * Math.max(0, areaWidth - pieceW),
    currentY: Math.random() * Math.max(0, areaHeight - pieceH),
    isPlaced: false,
  }));
}

/**
 * Check if a piece is close enough to its correct position to snap.
 *
 * @param {Object} piece - The piece object
 * @param {number} threshold - Snap distance threshold in pixels
 * @returns {boolean}
 */
export function isNearCorrectPosition(piece, threshold = 30) {
  const dx = Math.abs(piece.currentX - piece.correctX);
  const dy = Math.abs(piece.currentY - piece.correctY);
  return dx < threshold && dy < threshold;
}

/**
 * Snap a piece to its correct position.
 *
 * @param {Object} piece - The piece object
 * @returns {Object} Updated piece snapped to correct position
 */
export function snapPiece(piece) {
  return {
    ...piece,
    currentX: piece.correctX,
    currentY: piece.correctY,
    isPlaced: true,
  };
}

/**
 * Check if the puzzle is complete (all pieces placed).
 *
 * @param {Array} pieces - Array of piece objects
 * @returns {boolean}
 */
export function isPuzzleComplete(pieces) {
  return pieces.length > 0 && pieces.every((p) => p.isPlaced);
}

/**
 * Calculate difficulty parameters from a difficulty level.
 *
 * @param {'easy'|'medium'|'hard'|'expert'} difficulty
 * @returns {{ cols: number, rows: number, snapThreshold: number }}
 */
export function getDifficultySettings(difficulty) {
  switch (difficulty) {
    case 'easy':
      return { cols: 3, rows: 3, snapThreshold: 40 };
    case 'medium':
      return { cols: 5, rows: 4, snapThreshold: 30 };
    case 'hard':
      return { cols: 8, rows: 6, snapThreshold: 20 };
    case 'expert':
      return { cols: 12, rows: 9, snapThreshold: 15 };
    default:
      return { cols: 4, rows: 3, snapThreshold: 30 };
  }
}

/**
 * Format seconds into MM:SS string.
 *
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

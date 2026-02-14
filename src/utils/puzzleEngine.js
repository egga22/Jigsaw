/**
 * Core puzzle engine: generates pieces, handles snapping, rotation, and checks completion.
 */

/**
 * Generate jigsaw puzzle piece definitions.
 * Each piece has: id, row, col, correctX, correctY, currentX, currentY, width, height, rotation, isPlaced
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
        rotation: 0,
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
 * @param {'none'|'90'|'180'} rotationMode - Rotation mode
 * @returns {Array} Shuffled pieces with randomized currentX/currentY and rotation
 */
export function shufflePieces(pieces, areaWidth, areaHeight, pieceW, pieceH, rotationMode = 'none') {
  return pieces.map((piece) => ({
    ...piece,
    currentX: Math.random() * Math.max(0, areaWidth - pieceW),
    currentY: Math.random() * Math.max(0, areaHeight - pieceH),
    rotation: getRandomRotation(rotationMode),
    isPlaced: false,
  }));
}

/**
 * Check if a piece is close enough to its correct position to snap.
 * Also checks that the piece rotation is correct (0°).
 *
 * @param {Object} piece - The piece object
 * @param {number} threshold - Snap distance threshold in pixels
 * @returns {boolean}
 */
export function isNearCorrectPosition(piece, threshold = 30) {
  if (piece.rotation !== 0) return false;
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
    rotation: 0,
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

/**
 * Get a random rotation based on the rotation mode.
 *
 * @param {'none'|'90'|'180'} mode
 * @returns {number} Rotation in degrees (0, 90, 180, or 270)
 */
export function getRandomRotation(mode) {
  if (mode === '90') {
    const options = [0, 90, 180, 270];
    return options[Math.floor(Math.random() * options.length)];
  }
  if (mode === '180') {
    const options = [0, 180];
    return options[Math.floor(Math.random() * options.length)];
  }
  return 0;
}

/**
 * Rotate a piece by the given step (in degrees). Wraps around at 360.
 *
 * @param {Object} piece - The piece object
 * @param {number} step - Rotation step in degrees (e.g. 90)
 * @returns {Object} Updated piece with new rotation
 */
export function rotatePiece(piece, step = 90) {
  return {
    ...piece,
    rotation: (piece.rotation + step) % 360,
  };
}

/**
 * Compute cols and rows from a desired total piece count, fitting the given aspect ratio.
 *
 * @param {number} totalPieces - Desired total number of pieces
 * @param {number} aspectRatio - Image width / height
 * @returns {{ cols: number, rows: number }}
 */
export function getGridFromPieceCount(totalPieces, aspectRatio) {
  let bestCols = 1;
  let bestRows = totalPieces;
  let bestDiff = Infinity;

  for (let r = 1; r <= totalPieces; r++) {
    const c = Math.round(totalPieces / r);
    if (c < 1) continue;
    const cellAspect = (c / r);
    const diff = Math.abs(cellAspect - aspectRatio);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestCols = c;
      bestRows = r;
    }
  }

  return { cols: Math.max(1, bestCols), rows: Math.max(1, bestRows) };
}

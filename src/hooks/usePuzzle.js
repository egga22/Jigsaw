import { useState, useCallback } from 'react';
import {
  generatePieces,
  shufflePieces,
  isNearCorrectPosition,
  snapPiece,
  isPuzzleComplete,
} from '../utils/puzzleEngine';

/**
 * Custom hook managing all puzzle state and interactions.
 *
 * @param {Object} params
 * @param {number} params.cols
 * @param {number} params.rows
 * @param {number} params.imageWidth
 * @param {number} params.imageHeight
 * @param {number} params.snapThreshold
 * @param {Function} params.onComplete - Called when puzzle is finished
 * @param {Function} params.onFirstMove - Called on the first move
 */
export function usePuzzle({ cols, rows, imageWidth, imageHeight, snapThreshold, onComplete, onFirstMove }) {
  const [pieces, setPieces] = useState([]);
  const [moveCount, setMoveCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const initPuzzle = useCallback(() => {
    const generated = generatePieces(cols, rows, imageWidth, imageHeight);
    const shuffled = shufflePieces(
      generated,
      imageWidth,
      imageHeight,
      imageWidth / cols,
      imageHeight / rows
    );
    setPieces(shuffled);
    setMoveCount(0);
    setCompleted(false);
    setHasStarted(false);
  }, [cols, rows, imageWidth, imageHeight]);

  const movePiece = useCallback(
    (pieceId, newX, newY) => {
      if (completed) return;

      if (!hasStarted) {
        setHasStarted(true);
        onFirstMove?.();
      }

      setPieces((prev) => {
        const updated = prev.map((p) => {
          if (p.id !== pieceId || p.isPlaced) return p;
          const moved = { ...p, currentX: newX, currentY: newY };
          if (isNearCorrectPosition(moved, snapThreshold)) {
            return snapPiece(moved);
          }
          return moved;
        });

        if (!completed && isPuzzleComplete(updated)) {
          setCompleted(true);
          onComplete?.();
        }

        return updated;
      });

      setMoveCount((c) => c + 1);
    },
    [completed, hasStarted, snapThreshold, onComplete, onFirstMove]
  );

  return {
    pieces,
    moveCount,
    completed,
    initPuzzle,
    movePiece,
  };
}

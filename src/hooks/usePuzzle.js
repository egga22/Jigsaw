import { useState, useCallback } from 'react';
import {
  generatePieces,
  shufflePieces,
  isNearCorrectPosition,
  snapPiece,
  isPuzzleComplete,
  rotatePiece as rotatePieceUtil,
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
 * @param {'none'|'90'|'180'} params.rotationMode
 * @param {Function} params.onComplete - Called when puzzle is finished
 * @param {Function} params.onFirstMove - Called on the first move
 */
export function usePuzzle({ cols, rows, imageWidth, imageHeight, snapThreshold, rotationMode = 'none', onComplete, onFirstMove }) {
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
      imageHeight / rows,
      rotationMode
    );
    setPieces(shuffled);
    setMoveCount(0);
    setCompleted(false);
    setHasStarted(false);
  }, [cols, rows, imageWidth, imageHeight, rotationMode]);

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

  const rotatePiece = useCallback(
    (pieceId) => {
      if (completed) return;

      if (!hasStarted) {
        setHasStarted(true);
        onFirstMove?.();
      }

      const step = rotationMode === '180' ? 180 : 90;

      setPieces((prev) => {
        const updated = prev.map((p) => {
          if (p.id !== pieceId || p.isPlaced) return p;
          const rotated = rotatePieceUtil(p, step);
          if (isNearCorrectPosition(rotated, snapThreshold)) {
            return snapPiece(rotated);
          }
          return rotated;
        });

        if (!completed && isPuzzleComplete(updated)) {
          setCompleted(true);
          onComplete?.();
        }

        return updated;
      });

      setMoveCount((c) => c + 1);
    },
    [completed, hasStarted, rotationMode, snapThreshold, onComplete, onFirstMove]
  );

  const getHintPiece = useCallback(() => {
    const unplaced = pieces.filter((p) => !p.isPlaced);
    if (unplaced.length === 0) return null;
    return unplaced[Math.floor(Math.random() * unplaced.length)];
  }, [pieces]);

  return {
    pieces,
    moveCount,
    completed,
    initPuzzle,
    movePiece,
    rotatePiece,
    getHintPiece,
  };
}

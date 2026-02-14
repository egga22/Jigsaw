import { describe, it, expect } from 'vitest';
import {
  generatePieces,
  shufflePieces,
  isNearCorrectPosition,
  snapPiece,
  isPuzzleComplete,
  getDifficultySettings,
  formatTime,
} from '../utils/puzzleEngine';

describe('generatePieces', () => {
  it('generates correct number of pieces', () => {
    const pieces = generatePieces(3, 3, 300, 300);
    expect(pieces).toHaveLength(9);
  });

  it('generates correct number for non-square grid', () => {
    const pieces = generatePieces(5, 4, 500, 400);
    expect(pieces).toHaveLength(20);
  });

  it('assigns correct position to each piece', () => {
    const pieces = generatePieces(3, 2, 300, 200);
    const p = pieces.find((p) => p.row === 1 && p.col === 2);
    expect(p).toBeDefined();
    expect(p.correctX).toBe(200);
    expect(p.correctY).toBe(100);
    expect(p.width).toBe(100);
    expect(p.height).toBe(100);
  });

  it('initializes pieces as not placed', () => {
    const pieces = generatePieces(2, 2, 200, 200);
    pieces.forEach((p) => {
      expect(p.isPlaced).toBe(false);
    });
  });

  it('assigns unique ids to all pieces', () => {
    const pieces = generatePieces(4, 3, 400, 300);
    const ids = pieces.map((p) => p.id);
    expect(new Set(ids).size).toBe(12);
  });
});

describe('shufflePieces', () => {
  it('returns same number of pieces', () => {
    const original = generatePieces(3, 3, 300, 300);
    const shuffled = shufflePieces(original, 300, 300, 100, 100);
    expect(shuffled).toHaveLength(9);
  });

  it('marks all pieces as not placed', () => {
    const original = generatePieces(2, 2, 200, 200);
    original[0].isPlaced = true;
    const shuffled = shufflePieces(original, 200, 200, 100, 100);
    shuffled.forEach((p) => {
      expect(p.isPlaced).toBe(false);
    });
  });

  it('places pieces within bounds', () => {
    const original = generatePieces(3, 3, 300, 300);
    const shuffled = shufflePieces(original, 300, 300, 100, 100);
    shuffled.forEach((p) => {
      expect(p.currentX).toBeGreaterThanOrEqual(0);
      expect(p.currentX).toBeLessThanOrEqual(200);
      expect(p.currentY).toBeGreaterThanOrEqual(0);
      expect(p.currentY).toBeLessThanOrEqual(200);
    });
  });
});

describe('isNearCorrectPosition', () => {
  it('returns true when piece is at correct position', () => {
    const piece = { correctX: 100, correctY: 100, currentX: 100, currentY: 100 };
    expect(isNearCorrectPosition(piece, 30)).toBe(true);
  });

  it('returns true when within threshold', () => {
    const piece = { correctX: 100, correctY: 100, currentX: 115, currentY: 110 };
    expect(isNearCorrectPosition(piece, 30)).toBe(true);
  });

  it('returns false when outside threshold', () => {
    const piece = { correctX: 100, correctY: 100, currentX: 200, currentY: 200 };
    expect(isNearCorrectPosition(piece, 30)).toBe(false);
  });

  it('uses default threshold of 30', () => {
    const nearPiece = { correctX: 100, correctY: 100, currentX: 125, currentY: 125 };
    expect(isNearCorrectPosition(nearPiece)).toBe(true);

    const farPiece = { correctX: 100, correctY: 100, currentX: 135, currentY: 135 };
    expect(isNearCorrectPosition(farPiece)).toBe(false);
  });
});

describe('snapPiece', () => {
  it('snaps piece to correct position and marks as placed', () => {
    const piece = { correctX: 100, correctY: 200, currentX: 110, currentY: 195, isPlaced: false };
    const snapped = snapPiece(piece);
    expect(snapped.currentX).toBe(100);
    expect(snapped.currentY).toBe(200);
    expect(snapped.isPlaced).toBe(true);
  });

  it('does not mutate original piece', () => {
    const piece = { correctX: 50, correctY: 50, currentX: 55, currentY: 45, isPlaced: false };
    const snapped = snapPiece(piece);
    expect(piece.isPlaced).toBe(false);
    expect(snapped).not.toBe(piece);
  });
});

describe('isPuzzleComplete', () => {
  it('returns true when all pieces are placed', () => {
    const pieces = [
      { id: 0, isPlaced: true },
      { id: 1, isPlaced: true },
      { id: 2, isPlaced: true },
    ];
    expect(isPuzzleComplete(pieces)).toBe(true);
  });

  it('returns false when some pieces are not placed', () => {
    const pieces = [
      { id: 0, isPlaced: true },
      { id: 1, isPlaced: false },
      { id: 2, isPlaced: true },
    ];
    expect(isPuzzleComplete(pieces)).toBe(false);
  });

  it('returns false for empty array', () => {
    expect(isPuzzleComplete([])).toBe(false);
  });
});

describe('getDifficultySettings', () => {
  it('returns easy settings', () => {
    const s = getDifficultySettings('easy');
    expect(s.cols).toBe(3);
    expect(s.rows).toBe(3);
    expect(s.snapThreshold).toBe(40);
  });

  it('returns medium settings', () => {
    const s = getDifficultySettings('medium');
    expect(s.cols).toBe(5);
    expect(s.rows).toBe(4);
  });

  it('returns hard settings', () => {
    const s = getDifficultySettings('hard');
    expect(s.cols).toBe(8);
    expect(s.rows).toBe(6);
  });

  it('returns expert settings', () => {
    const s = getDifficultySettings('expert');
    expect(s.cols).toBe(12);
    expect(s.rows).toBe(9);
  });

  it('returns default for unknown difficulty', () => {
    const s = getDifficultySettings('unknown');
    expect(s.cols).toBe(4);
    expect(s.rows).toBe(3);
  });
});

describe('formatTime', () => {
  it('formats 0 seconds', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats seconds only', () => {
    expect(formatTime(45)).toBe('00:45');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('02:05');
  });

  it('formats large values', () => {
    expect(formatTime(3661)).toBe('61:01');
  });
});

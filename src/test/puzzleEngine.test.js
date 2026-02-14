import { describe, it, expect } from 'vitest';
import {
  generatePieces,
  shufflePieces,
  isNearCorrectPosition,
  snapPiece,
  isPuzzleComplete,
  getDifficultySettings,
  formatTime,
  getRandomRotation,
  rotatePiece,
  getGridFromPieceCount,
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

  it('initializes pieces as not placed with 0 rotation', () => {
    const pieces = generatePieces(2, 2, 200, 200);
    pieces.forEach((p) => {
      expect(p.isPlaced).toBe(false);
      expect(p.rotation).toBe(0);
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

  it('assigns rotation 0 when rotationMode is none', () => {
    const original = generatePieces(3, 3, 300, 300);
    const shuffled = shufflePieces(original, 300, 300, 100, 100, 'none');
    shuffled.forEach((p) => {
      expect(p.rotation).toBe(0);
    });
  });

  it('assigns rotations from valid set when rotationMode is 90', () => {
    const original = generatePieces(4, 4, 400, 400);
    const shuffled = shufflePieces(original, 400, 400, 100, 100, '90');
    shuffled.forEach((p) => {
      expect([0, 90, 180, 270]).toContain(p.rotation);
    });
  });

  it('assigns rotations from valid set when rotationMode is 180', () => {
    const original = generatePieces(4, 4, 400, 400);
    const shuffled = shufflePieces(original, 400, 400, 100, 100, '180');
    shuffled.forEach((p) => {
      expect([0, 180]).toContain(p.rotation);
    });
  });
});

describe('isNearCorrectPosition', () => {
  it('returns true when piece is at correct position with rotation 0', () => {
    const piece = { correctX: 100, correctY: 100, currentX: 100, currentY: 100, rotation: 0 };
    expect(isNearCorrectPosition(piece, 30)).toBe(true);
  });

  it('returns true when within threshold with rotation 0', () => {
    const piece = { correctX: 100, correctY: 100, currentX: 115, currentY: 110, rotation: 0 };
    expect(isNearCorrectPosition(piece, 30)).toBe(true);
  });

  it('returns false when outside threshold', () => {
    const piece = { correctX: 100, correctY: 100, currentX: 200, currentY: 200, rotation: 0 };
    expect(isNearCorrectPosition(piece, 30)).toBe(false);
  });

  it('returns false when rotation is not 0 even if position is correct', () => {
    const piece = { correctX: 100, correctY: 100, currentX: 100, currentY: 100, rotation: 90 };
    expect(isNearCorrectPosition(piece, 30)).toBe(false);
  });

  it('uses default threshold of 30', () => {
    const nearPiece = { correctX: 100, correctY: 100, currentX: 125, currentY: 125, rotation: 0 };
    expect(isNearCorrectPosition(nearPiece)).toBe(true);

    const farPiece = { correctX: 100, correctY: 100, currentX: 135, currentY: 135, rotation: 0 };
    expect(isNearCorrectPosition(farPiece)).toBe(false);
  });
});

describe('snapPiece', () => {
  it('snaps piece to correct position and marks as placed with rotation 0', () => {
    const piece = { correctX: 100, correctY: 200, currentX: 110, currentY: 195, rotation: 0, isPlaced: false };
    const snapped = snapPiece(piece);
    expect(snapped.currentX).toBe(100);
    expect(snapped.currentY).toBe(200);
    expect(snapped.rotation).toBe(0);
    expect(snapped.isPlaced).toBe(true);
  });

  it('does not mutate original piece', () => {
    const piece = { correctX: 50, correctY: 50, currentX: 55, currentY: 45, rotation: 0, isPlaced: false };
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

describe('getRandomRotation', () => {
  it('returns 0 for none mode', () => {
    for (let i = 0; i < 20; i++) {
      expect(getRandomRotation('none')).toBe(0);
    }
  });

  it('returns valid rotation for 90 mode', () => {
    const validValues = [0, 90, 180, 270];
    for (let i = 0; i < 50; i++) {
      expect(validValues).toContain(getRandomRotation('90'));
    }
  });

  it('returns valid rotation for 180 mode', () => {
    const validValues = [0, 180];
    for (let i = 0; i < 50; i++) {
      expect(validValues).toContain(getRandomRotation('180'));
    }
  });

  it('returns 0 for unknown mode', () => {
    expect(getRandomRotation('unknown')).toBe(0);
  });
});

describe('rotatePiece', () => {
  it('rotates piece by 90 degrees', () => {
    const piece = { rotation: 0 };
    expect(rotatePiece(piece, 90).rotation).toBe(90);
  });

  it('wraps rotation at 360', () => {
    const piece = { rotation: 270 };
    expect(rotatePiece(piece, 90).rotation).toBe(0);
  });

  it('rotates by 180 degrees', () => {
    const piece = { rotation: 90 };
    expect(rotatePiece(piece, 180).rotation).toBe(270);
  });

  it('does not mutate original piece', () => {
    const piece = { rotation: 90 };
    const rotated = rotatePiece(piece, 90);
    expect(piece.rotation).toBe(90);
    expect(rotated.rotation).toBe(180);
  });

  it('defaults to 90 degree step', () => {
    const piece = { rotation: 0 };
    expect(rotatePiece(piece).rotation).toBe(90);
  });
});

describe('getGridFromPieceCount', () => {
  it('returns reasonable grid for 12 pieces with 4:3 ratio', () => {
    const { cols, rows } = getGridFromPieceCount(12, 4 / 3);
    expect(cols * rows).toBeGreaterThanOrEqual(10);
    expect(cols * rows).toBeLessThanOrEqual(16);
    expect(cols).toBeGreaterThanOrEqual(1);
    expect(rows).toBeGreaterThanOrEqual(1);
  });

  it('returns reasonable grid for 25 pieces with 1:1 ratio', () => {
    const { cols, rows } = getGridFromPieceCount(25, 1);
    expect(cols).toBe(5);
    expect(rows).toBe(5);
  });

  it('returns at least 1 col and 1 row', () => {
    const { cols, rows } = getGridFromPieceCount(1, 1);
    expect(cols).toBeGreaterThanOrEqual(1);
    expect(rows).toBeGreaterThanOrEqual(1);
  });
});

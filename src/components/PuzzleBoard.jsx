import { useRef, useEffect, useCallback, useState } from 'react';
import './PuzzleBoard.css';

/**
 * Canvas-based puzzle board with drag-and-drop.
 */
export default function PuzzleBoard({
  pieces,
  image,
  imageWidth,
  imageHeight,
  cols,
  rows,
  onMovePiece,
  showPreview,
  completed,
}) {
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const piecesRef = useRef(pieces);

  useEffect(() => {
    piecesRef.current = pieces;
  }, [pieces]);

  const pieceW = imageWidth / cols;
  const pieceH = imageHeight / rows;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid guides
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * pieceW, 0);
      ctx.lineTo(c * pieceW, imageHeight);
      ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * pieceH);
      ctx.lineTo(imageWidth, r * pieceH);
      ctx.stroke();
    }

    // Draw preview overlay
    if (showPreview) {
      ctx.globalAlpha = 0.2;
      ctx.drawImage(image, 0, 0, imageWidth, imageHeight);
      ctx.globalAlpha = 1.0;
    }

    const renderPiece = (context, piece, isDragged = false) => {
      const sx = piece.col * pieceW;
      const sy = piece.row * pieceH;

      context.save();

      // Clip region for the piece
      context.beginPath();
      context.roundRect(piece.currentX, piece.currentY, pieceW, pieceH, 3);
      context.clip();

      // Draw the image portion
      context.drawImage(
        image,
        sx,
        sy,
        pieceW,
        pieceH,
        piece.currentX,
        piece.currentY,
        pieceW,
        pieceH
      );

      context.restore();

      // Draw border
      context.strokeStyle = piece.isPlaced
        ? 'rgba(76, 209, 55, 0.6)'
        : isDragged
          ? 'rgba(108, 99, 255, 0.8)'
          : 'rgba(255,255,255,0.3)';
      context.lineWidth = piece.isPlaced ? 2 : isDragged ? 2.5 : 1.5;
      context.beginPath();
      context.roundRect(piece.currentX, piece.currentY, pieceW, pieceH, 3);
      context.stroke();

      // Shadow for dragged piece
      if (isDragged) {
        context.shadowColor = 'rgba(108,99,255,0.5)';
        context.shadowBlur = 15;
      }
    };

    const currentPieces = piecesRef.current;

    // Draw placed pieces first (lower z-index)
    currentPieces.filter((p) => p.isPlaced).forEach((p) => renderPiece(ctx, p));

    // Draw unplaced pieces (except the one being dragged)
    currentPieces
      .filter((p) => !p.isPlaced && p.id !== dragging?.id)
      .forEach((p) => renderPiece(ctx, p));

    // Draw dragged piece on top
    if (dragging) {
      const dp = currentPieces.find((p) => p.id === dragging.id);
      if (dp) renderPiece(ctx, dp, true);
    }
  }, [image, imageWidth, imageHeight, cols, rows, pieceW, pieceH, showPreview, dragging]);

  useEffect(() => {
    draw();
  }, [draw, pieces]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const findPieceAtCoords = (x, y) => {
    // Search in reverse order (topmost pieces first)
    const currentPieces = piecesRef.current;
    for (let i = currentPieces.length - 1; i >= 0; i--) {
      const p = currentPieces[i];
      if (p.isPlaced) continue;
      if (
        x >= p.currentX &&
        x <= p.currentX + pieceW &&
        y >= p.currentY &&
        y <= p.currentY + pieceH
      ) {
        return p;
      }
    }
    return null;
  };

  const handlePointerDown = (e) => {
    if (completed) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    const piece = findPieceAtCoords(coords.x, coords.y);
    if (piece) {
      setDragging(piece);
      setOffset({
        x: coords.x - piece.currentX,
        y: coords.y - piece.currentY,
      });
    }
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    const newX = Math.max(0, Math.min(imageWidth - pieceW, coords.x - offset.x));
    const newY = Math.max(0, Math.min(imageHeight - pieceH, coords.y - offset.y));
    onMovePiece(dragging.id, newX, newY);
  };

  const handlePointerUp = () => {
    setDragging(null);
  };

  return (
    <div className="puzzle-board-wrapper">
      <canvas
        ref={canvasRef}
        width={imageWidth}
        height={imageHeight}
        className={`puzzle-canvas ${completed ? 'completed' : ''}`}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
      {completed && (
        <div className="completion-overlay">
          <div className="completion-content">
            <span className="completion-icon">🎉</span>
            <h2>Puzzle Complete!</h2>
            <p>Congratulations! You solved the puzzle!</p>
          </div>
        </div>
      )}
    </div>
  );
}

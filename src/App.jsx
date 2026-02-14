import { useState, useEffect, useCallback, useRef } from 'react';
import ImageUploader from './components/ImageUploader';
import SettingsPanel from './components/SettingsPanel';
import PuzzleBoard from './components/PuzzleBoard';
import Toolbar from './components/Toolbar';
import { usePuzzle } from './hooks/usePuzzle';
import { useTimer } from './hooks/useTimer';
import { getDifficultySettings, shufflePieces } from './utils/puzzleEngine';
import './App.css';

const PUZZLE_WIDTH = 800;
const PUZZLE_HEIGHT = 600;

export default function App() {
  const [screen, setScreen] = useState('upload'); // 'upload' | 'settings' | 'playing'
  const [imageSrc, setImageSrc] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [customCols, setCustomCols] = useState(6);
  const [customRows, setCustomRows] = useState(4);
  const [rotationMode, setRotationMode] = useState('none');
  const [showPreview, setShowPreview] = useState(false);
  const [hintPiece, setHintPiece] = useState(null);

  const getSettings = useCallback(() => {
    if (difficulty === 'custom') {
      const total = customCols * customRows;
      const snapThreshold = total <= 12 ? 40 : total <= 30 ? 30 : total <= 60 ? 20 : 15;
      return { cols: customCols, rows: customRows, snapThreshold };
    }
    return getDifficultySettings(difficulty);
  }, [difficulty, customCols, customRows]);

  const settings = getSettings();
  const timer = useTimer();

  const puzzle = usePuzzle({
    cols: settings.cols,
    rows: settings.rows,
    imageWidth: PUZZLE_WIDTH,
    imageHeight: PUZZLE_HEIGHT,
    snapThreshold: settings.snapThreshold,
    rotationMode,
    onComplete: () => timer.stop(),
    onFirstMove: () => timer.start(),
  });

  const handleImageSelect = useCallback((src) => {
    setImageSrc(src);
    setScreen('settings');
  }, []);

  const handleStart = useCallback(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageObj(img);
      setScreen('playing');
    };
    img.onerror = () => {
      // If CORS fails, try without crossOrigin for data URLs
      const img2 = new Image();
      img2.onload = () => {
        setImageObj(img2);
        setScreen('playing');
      };
      img2.src = imageSrc;
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Initialize puzzle when entering playing screen
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (screen === 'playing' && imageObj && !hasInitialized.current) {
      hasInitialized.current = true;
      timer.reset();
      puzzle.initPuzzle();
    }
    if (screen !== 'playing') {
      hasInitialized.current = false;
    }
  }, [screen, imageObj, timer, puzzle]);

  const handleShuffle = useCallback(() => {
    if (puzzle.completed) return;
    const pw = PUZZLE_WIDTH / settings.cols;
    const ph = PUZZLE_HEIGHT / settings.rows;
    const reshuffled = shufflePieces(
      puzzle.pieces.filter((p) => !p.isPlaced),
      PUZZLE_WIDTH,
      PUZZLE_HEIGHT,
      pw,
      ph,
      rotationMode
    );
    // Re-apply shuffled positions through movePiece
    reshuffled.forEach((p) => {
      puzzle.movePiece(p.id, p.currentX, p.currentY);
    });
  }, [puzzle, settings, rotationMode]);

  const handleHint = useCallback(() => {
    const piece = puzzle.getHintPiece();
    if (!piece) return;
    setHintPiece(piece);
    // Auto-clear the hint after 3 seconds
    setTimeout(() => setHintPiece(null), 3000);
  }, [puzzle]);

  const handleReset = useCallback(() => {
    timer.reset();
    setHintPiece(null);
    setScreen('upload');
    setImageSrc(null);
    setImageObj(null);
  }, [timer]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧩 Jigsaw Puzzle</h1>
        <p className="subtitle">Upload an image and solve the puzzle!</p>
      </header>

      <main className="app-main">
        {screen === 'upload' && (
          <ImageUploader onImageSelect={handleImageSelect} />
        )}

        {screen === 'settings' && (
          <SettingsPanel
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            customCols={customCols}
            customRows={customRows}
            onCustomColsChange={setCustomCols}
            onCustomRowsChange={setCustomRows}
            rotationMode={rotationMode}
            onRotationModeChange={setRotationMode}
            onStart={handleStart}
            imageSrc={imageSrc}
          />
        )}

        {screen === 'playing' && imageObj && (
          <div className="game-container">
            <Toolbar
              seconds={timer.seconds}
              moveCount={puzzle.moveCount}
              showPreview={showPreview}
              onTogglePreview={() => setShowPreview((v) => !v)}
              onShuffle={handleShuffle}
              onHint={handleHint}
              onReset={handleReset}
              completed={puzzle.completed}
              rotationMode={rotationMode}
            />
            <div className="board-container">
              <PuzzleBoard
                pieces={puzzle.pieces}
                image={imageObj}
                imageWidth={PUZZLE_WIDTH}
                imageHeight={PUZZLE_HEIGHT}
                cols={settings.cols}
                rows={settings.rows}
                onMovePiece={puzzle.movePiece}
                onRotatePiece={puzzle.rotatePiece}
                showPreview={showPreview}
                completed={puzzle.completed}
                hintPiece={hintPiece}
                rotationMode={rotationMode}
              />
            </div>
            {puzzle.completed && (
              <div className="completion-stats">
                <p>
                  ⏱️ Time: <strong>{timer.seconds}s</strong> &nbsp;|&nbsp; 🔄 Moves:{' '}
                  <strong>{puzzle.moveCount}</strong>
                </p>
                <button className="play-again-btn" onClick={handleReset}>
                  🔁 Play Again
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Made with ❤️ | Drag pieces to their correct positions</p>
      </footer>
    </div>
  );
}

import { formatTime } from '../utils/puzzleEngine';
import './Toolbar.css';

/**
 * Top toolbar displaying timer, moves, and action buttons.
 */
export default function Toolbar({
  seconds,
  moveCount,
  showPreview,
  onTogglePreview,
  onShuffle,
  onReset,
  completed,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-stats">
        <div className="stat">
          <span className="stat-icon">⏱️</span>
          <span className="stat-value">{formatTime(seconds)}</span>
        </div>
        <div className="stat">
          <span className="stat-icon">🔄</span>
          <span className="stat-value">{moveCount} moves</span>
        </div>
      </div>

      <div className="toolbar-actions">
        <button
          className={`toolbar-btn ${showPreview ? 'active' : ''}`}
          onClick={onTogglePreview}
          title="Toggle image preview"
        >
          👁️ Preview
        </button>
        <button
          className="toolbar-btn"
          onClick={onShuffle}
          disabled={completed}
          title="Reshuffle pieces"
        >
          🔀 Shuffle
        </button>
        <button className="toolbar-btn danger" onClick={onReset} title="Start over">
          ✖ New Puzzle
        </button>
      </div>
    </div>
  );
}

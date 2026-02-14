import './SettingsPanel.css';

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy (3×3)', icon: '🟢' },
  { value: 'medium', label: 'Medium (5×4)', icon: '🟡' },
  { value: 'hard', label: 'Hard (8×6)', icon: '🟠' },
  { value: 'expert', label: 'Expert (12×9)', icon: '🔴' },
];

/**
 * Settings panel for configuring the puzzle before starting.
 */
export default function SettingsPanel({ difficulty, onDifficultyChange, onStart, imageSrc }) {
  return (
    <div className="settings-panel">
      <h2>Puzzle Settings</h2>

      {imageSrc && (
        <div className="image-preview-small">
          <img src={imageSrc} alt="Selected puzzle" />
        </div>
      )}

      <div className="setting-group">
        <label className="setting-label">Difficulty</label>
        <div className="difficulty-options">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              className={`difficulty-btn ${difficulty === d.value ? 'active' : ''}`}
              onClick={() => onDifficultyChange(d.value)}
            >
              <span className="diff-icon">{d.icon}</span>
              <span className="diff-label">{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="start-btn" onClick={onStart} disabled={!imageSrc}>
        🧩 Start Puzzle
      </button>
    </div>
  );
}

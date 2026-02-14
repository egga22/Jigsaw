import { useState } from 'react';
import './SettingsPanel.css';

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy (3×3)', icon: '🟢' },
  { value: 'medium', label: 'Medium (5×4)', icon: '🟡' },
  { value: 'hard', label: 'Hard (8×6)', icon: '🟠' },
  { value: 'expert', label: 'Expert (12×9)', icon: '🔴' },
  { value: 'custom', label: 'Custom', icon: '⚙️' },
];

const ROTATION_MODES = [
  { value: 'none', label: 'None', icon: '🔒' },
  { value: '90', label: '90°', icon: '🔄' },
  { value: '180', label: '180°', icon: '↕️' },
];

/**
 * Settings panel for configuring the puzzle before starting.
 */
export default function SettingsPanel({
  difficulty,
  onDifficultyChange,
  customCols,
  customRows,
  onCustomColsChange,
  onCustomRowsChange,
  rotationMode,
  onRotationModeChange,
  onStart,
  imageSrc,
}) {
  const [colsInput, setColsInput] = useState(String(customCols));
  const [rowsInput, setRowsInput] = useState(String(customRows));

  const handleColsChange = (val) => {
    setColsInput(val);
    const n = parseInt(val, 10);
    if (n >= 2 && n <= 20) onCustomColsChange(n);
  };

  const handleRowsChange = (val) => {
    setRowsInput(val);
    const n = parseInt(val, 10);
    if (n >= 2 && n <= 20) onCustomRowsChange(n);
  };

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

      {difficulty === 'custom' && (
        <div className="setting-group custom-grid-group">
          <label className="setting-label">Grid Size</label>
          <div className="custom-grid-inputs">
            <div className="grid-input-row">
              <label htmlFor="custom-cols">Columns</label>
              <input
                id="custom-cols"
                type="number"
                min={2}
                max={20}
                value={colsInput}
                onChange={(e) => handleColsChange(e.target.value)}
                className="grid-input"
              />
            </div>
            <span className="grid-x">×</span>
            <div className="grid-input-row">
              <label htmlFor="custom-rows">Rows</label>
              <input
                id="custom-rows"
                type="number"
                min={2}
                max={20}
                value={rowsInput}
                onChange={(e) => handleRowsChange(e.target.value)}
                className="grid-input"
              />
            </div>
          </div>
          <p className="grid-summary">{customCols * customRows} pieces</p>
        </div>
      )}

      <div className="setting-group">
        <label className="setting-label">Piece Rotation</label>
        <div className="rotation-options">
          {ROTATION_MODES.map((r) => (
            <button
              key={r.value}
              className={`rotation-btn ${rotationMode === r.value ? 'active' : ''}`}
              onClick={() => onRotationModeChange(r.value)}
            >
              <span className="rot-icon">{r.icon}</span>
              <span className="rot-label">{r.label}</span>
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

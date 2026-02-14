import { useRef } from 'react';
import './ImageUploader.css';

/**
 * Component for uploading a custom image or using a sample image.
 */
export default function ImageUploader({ onImageSelect }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      onImageSelect(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      onImageSelect(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const sampleImages = [
    { url: 'https://picsum.photos/seed/mountain/800/600', label: '🏔️ Mountain' },
    { url: 'https://picsum.photos/seed/ocean/800/600', label: '🌊 Ocean' },
    { url: 'https://picsum.photos/seed/forest/800/600', label: '🌲 Forest' },
    { url: 'https://picsum.photos/seed/city/800/600', label: '🏙️ City' },
  ];

  return (
    <div className="image-uploader">
      <h2>Choose Your Puzzle Image</h2>

      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
        }}
      >
        <div className="drop-zone-content">
          <span className="drop-icon">📁</span>
          <p>Drop an image here or click to upload</p>
          <p className="drop-hint">Supports JPG, PNG, GIF, WebP</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
          aria-label="Upload puzzle image"
        />
      </div>

      <div className="divider">
        <span>or choose a sample image</span>
      </div>

      <div className="sample-images">
        {sampleImages.map((img) => (
          <button
            key={img.url}
            className="sample-btn"
            onClick={() => onImageSelect(img.url)}
          >
            {img.label}
          </button>
        ))}
      </div>
    </div>
  );
}

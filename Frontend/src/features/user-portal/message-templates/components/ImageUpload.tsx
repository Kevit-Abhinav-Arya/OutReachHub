import React, { useState, useRef } from 'react';
import apiClient from '../../../../api/client';
import './ImageUpload.scss';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post('/message-templates/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      const imageUrl = result.data.imageUrl; // Use the full URL from backend
      
      onChange(imageUrl);
      setPreview(imageUrl);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
      setError(errorMessage);
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`image-upload ${className}`}>
      <div className="image-upload__container">
        {preview ? (
          <div className="image-upload__preview">
            <img src={preview} alt="Preview" className="image-upload__image" />
            <div className="image-upload__overlay">
              <button
                type="button"
                onClick={handleClick}
                disabled={disabled || isUploading}
                className="image-upload__change-btn"
              >
                {isUploading ? 'Uploading...' : 'Change Image'}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="image-upload__remove-btn"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`image-upload__dropzone ${isUploading ? 'uploading' : ''}`}
            onClick={handleClick}
          >
            <div className="image-upload__content">
              <div className="image-upload__icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C13.1 2 14 2.9 14 4V10H20C21.1 10 22 10.9 22 12C22 13.1 21.1 14 20 14H14V20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20V14H4C2.9 14 2 13.1 2 12C2 10.9 2.9 10 4 10H10V4C10 2.9 10.9 2 12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <p className="image-upload__text">
                {isUploading ? 'Uploading...' : 'Click to upload image'}
              </p>
              <p className="image-upload__subtext">
                JPEG, PNG, GIF, WebP (Max 5MB)
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="image-upload__input"
      />

      {error && (
        <div className="image-upload__error">
          {error}
        </div>
      )}
    </div>
  );
};
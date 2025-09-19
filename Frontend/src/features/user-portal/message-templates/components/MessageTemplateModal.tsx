import React from 'react';
import type { MessageTemplateModalProps } from '../types';
import { ImageUpload } from './ImageUpload';
import './MessageTemplateModal.scss';



const MessageTemplateModal: React.FC<MessageTemplateModalProps> = ({
  isOpen,
  onClose,
  template,
  mode,
  formData,
  onFormChange,
  onSubmit,
  onDelete,
  onCopy
}) => {
  if (!isOpen || !mode) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Create New Template';
      case 'edit': return 'Edit Template';
      case 'view': return 'View Template';
      case 'delete': return 'Delete Template';
      case 'copy': return 'Copy Template';
      default: return '';
    }
  };

  const renderModalContent = () => {
    switch (mode) {
      case 'view':
        return (
          <div className="template-details">
            <div className="detail-row">
              <label>Name:</label>
              <span>{template?.name}</span>
            </div>
            <div className="detail-row">
              <label>Type:</label>
              <span>{template?.type}</span>
            </div>
            <div className="detail-row">
              <label>Content:</label>
              <div className="form-group"><textarea 
                value={template?.body}
                rows={mode === 'view' ? 6 : 8}
                disabled
              /></div>
            </div>
            {template?.imageUrl && (
              <div className="detail-row">
                <label>Image:</label>
                <img src={template.imageUrl} alt="Template" className="preview-image" />
              </div>
            )}
            <div className="detail-row">
              <label>Created By:</label>
              <span>{template?.createdBy.name} ({template?.createdBy.email})</span>
            </div>
            <div className="detail-row">
              <label>Created Date:</label>
              <span>{template?.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          
          </div>
        );

      case 'delete':
        return (
          <div className="delete-confirmation">
            <div className="warning-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Delete Template</h3>
            <p>Are you sure you want to delete "{template?.name}"?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn-danger" onClick={onDelete}>Delete Template</button>
            </div>
          </div>
        );

      case 'copy':
        return (
          <div className="copy-confirmation">
            <div className="copy-icon">
              <i className="fas fa-copy"></i>
            </div>
            <h3>Copy Template</h3>
            <p>Create a copy of "{template?.name}"?</p>
            <p className="info-text">The copy will be created with the same content and settings.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={onCopy}>Copy Template</button>
            </div>
          </div>
        );

      case 'create':
      case 'edit':
        return (
          <div className="template-form">
            <div className="form-group">
              <label>Template Name *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => onFormChange('name', e.target.value)}
                placeholder="Enter template name..." 
                maxLength={25}
                required
              />
             <div className="form-help">
                <small>Max length of the name should be 25 characters</small>
              </div>
            </div>

            <div className="form-group">
              <label>Template Type *</label>
              <select 
                value={formData.type}
                onChange={(e) => onFormChange('type', e.target.value)}
                required
              >
                <option value="Text">Text Only</option>
                <option value="Text & Image">Text & Image</option>
              </select>
            </div>

            <div className="form-group">
              <label>Content *</label>
              <textarea 
                value={formData.body}
                onChange={(e) => onFormChange('body', e.target.value)}
                placeholder="Enter your message content..." 
                rows={mode === 'create' ? 6 : 8}
                required
              />
              <div className="form-help">
                <small>You can use variables like {`{firstName}, {lastName}, {companyName}`} in your content.</small>
              </div>
            </div>

            {formData.type === 'Text & Image' && (
              <div className="form-group">
                <label>Image</label>
                <ImageUpload
                  value={formData.imageUrl || undefined}
                  onChange={(imageUrl) => onFormChange('imageUrl', imageUrl)}
                />
                <div className="form-help">
                  <small>Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB</small>
                </div>
              </div>
            )}

          

            <div className="modal-actions">
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={onSubmit}
                disabled={!formData.name.trim() || !formData.body.trim()}
              >
                {mode === 'create' ? 'Create Template' : 'Save Changes'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content template-modal ${mode}`}>
        <div className="modal-header">
          <h2>
            <i className={`fas ${
              mode === 'create' ? 'fa-plus' :
              mode === 'edit' ? 'fa-edit' :
              mode === 'view' ? 'fa-eye' :
              mode === 'delete' ? 'fa-trash' :
              mode === 'copy' ? 'fa-copy' : 'fa-file-alt'
            }`}></i>
            {getModalTitle()}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {renderModalContent()}
        </div>
      </div>
    </div>
  );
};

export default MessageTemplateModal;

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Campaign } from '../types';
import { 
  createCampaignAsync,
  updateCampaignAsync,
  fetchWorkspaceTags,
  fetchMessageTemplates
} from '../slices/campaignsSlice';
import type { RootState, AppDispatch } from '@/store';
import './CampaignModal.scss';

interface CampaignModalProps {
  type: 'create' | 'edit';
  campaign?: Campaign;
  onClose: () => void;
}

const CampaignModal: React.FC<CampaignModalProps> = ({ type, campaign, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { workspaceTags, messageTemplates, loading } = useSelector((state: RootState) => state.campaigns);

  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    targetTags: campaign?.targetTags || [],
    templateId: campaign?.templateId || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch tags and templates on mount
  useEffect(() => {
    dispatch(fetchWorkspaceTags());
    dispatch(fetchMessageTemplates());
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      targetTags: prev.targetTags.includes(tag)
        ? prev.targetTags.filter(t => t !== tag)
        : [...prev.targetTags, tag]
    }));
    
    if (errors.targetTags) {
      setErrors(prev => ({ ...prev, targetTags: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (formData.targetTags.length === 0) {
      newErrors.targetTags = 'At least one target tag must be selected';
    }

    if (!formData.templateId) {
      newErrors.templateId = 'Message template must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (type === 'create') {
        await dispatch(createCampaignAsync({
          name: formData.name.trim(),
          targetTags: formData.targetTags,
          templateId: formData.templateId
        })).unwrap();
      } else if (campaign) {
        await dispatch(updateCampaignAsync({
          id: campaign.id,
          campaignData: {
            name: formData.name.trim(),
            targetTags: formData.targetTags,
            templateId: formData.templateId
          }
        })).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Failed to save campaign:', error);
    }
  };

  const getSelectedTemplate = () => {
    const template = messageTemplates.find((t: any) => t.id === formData.templateId);
   
    return template;
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal campaign-modal">
        <div className="modal-header">
          <h2>{type === 'create' ? 'Create New Campaign' : 'Edit Campaign'}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-section">
            <h3>Campaign Details</h3>
            
            <div className="form-group">
              <label htmlFor="name">Campaign Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                maxLength={25}
                className={errors.name ? 'error' : ''}
                placeholder="Enter campaign name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
               <div className="form-help">
                <small>Max length of the name should be 25 characters</small>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Target Audience</h3>
            
            <div className="form-group">
              <label>Select Tags *</label>
              <div className="tags-grid">
                {workspaceTags.map((tag: string) => (
                  <label key={tag} className="tag-option">
                    <input
                      type="checkbox"
                      checked={formData.targetTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                    />
                    <span className="tag-label">{tag}</span>
                  </label>
                ))}
              </div>
              {errors.targetTags && <span className="error-message">{errors.targetTags}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3>Message Template</h3>
            
            <div className="form-group">
              <label htmlFor="templateId">Select Template *</label>
              <select
                id="templateId"
                name="templateId"
                value={formData.templateId}
                onChange={handleInputChange}
                className={errors.templateId ? 'error' : ''}
              >
                <option value="">Choose a message template</option>
                {messageTemplates.map((template: any) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.type || 'Text'})
                  </option>
                ))}
              </select>
              {errors.templateId && <span className="error-message">{errors.templateId}</span>}
            </div>

            {getSelectedTemplate() && (
              <div className="template-preview">
                <h4>Template Preview</h4>
                <div className="preview-card">
                  <div className="preview-header">
                    <span className="template-name">{getSelectedTemplate()?.name}</span>
                    <span className='tag'>
                      {getSelectedTemplate()?.type || 'Text'}
                    </span>
                  </div>
                  <div className="preview-content">
                    {getSelectedTemplate()?.body || 'No content available'}
                  </div>
                  {getSelectedTemplate()?.type === 'Text & Image' && (
                    <div className="preview-image">
                      {getSelectedTemplate()?.imageUrl ? (
                        <div className="actual-image-preview">
                          <img src={getSelectedTemplate()?.imageUrl} alt="Template preview" />
                        </div>
                      ) : (
                        <div className="preview-image-placeholder">
                          <i className="fas fa-image"></i>
                          <span>No image uploaded</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="form-section campaign-summary">
            <h3>Campaign Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Campaign Name:</span>
                <span className="summary-value">{formData.name || 'Not set'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Target Tags:</span>
                <span className="summary-value">
                  {formData.targetTags.length > 0 ? formData.targetTags.join(', ') : 'None selected'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Message Template:</span>
                <span className="summary-value">{getSelectedTemplate()?.name || 'None selected'}</span>
              </div>
            </div>
          </div>
        </form>

        <div className="modal-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="save-btn" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : (type === 'create' ? 'Create Campaign' : 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignModal;

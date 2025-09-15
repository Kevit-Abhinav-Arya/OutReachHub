import React, { useState, useEffect } from 'react';
import type { Campaign } from '../types';
import './CampaignModal.scss';

interface CampaignModalProps {
  type: 'create' | 'edit';
  campaign?: Campaign;
  onClose: () => void;
  onSave: (campaign: Partial<Campaign>) => void;
}

interface MessageTemplate {
  id: string;
  name: string;
  type: 'text' | 'text-image';
  content: string;
}

const CampaignModal: React.FC<CampaignModalProps> = ({ type, campaign, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    targetTags: campaign?.targetTags || [],
    messageTemplateId: campaign?.messageTemplateId || ''
  });

  const [availableTags] = useState([
    'Lead', 'Customer', 'Premium', 'Enterprise', 'Tech', 'Support', 
    'Newsletter', 'Active', 'Inactive', 'VIP', 'Prospect', 'Partner'
  ]);

  const [messageTemplates] = useState<MessageTemplate[]>([
    {
      id: '1',
      name: 'Summer Launch Template',
      type: 'text-image',
      content: 'Check out our amazing summer collection! Limited time offer.'
    },
    {
      id: '2',
      name: 'Weekly Newsletter Template',
      type: 'text',
      content: 'Your weekly update is here with the latest news and updates.'
    },
    {
      id: '3',
      name: 'Support Follow-up Template',
      type: 'text',
      content: 'Thank you for contacting support. How was your experience?'
    },
    {
      id: '4',
      name: 'Product Launch Template',
      type: 'text-image',
      content: 'Introducing our latest product! Be the first to try it.'
    },
    {
      id: '5',
      name: 'Welcome Message Template',
      type: 'text',
      content: 'Welcome to our community! We\'re excited to have you.'
    }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contactsCount, setContactsCount] = useState(0);

  useEffect(() => {
    // Simulate fetching contacts count based on selected tags
    if (formData.targetTags.length > 0) {
      // Mock calculation - in real app, this would be an API call
      const mockContactsPerTag = {
        'Lead': 45,
        'Customer': 120,
        'Premium': 78,
        'Enterprise': 23,
        'Tech': 65,
        'Support': 34,
        'Newsletter': 200,
        'Active': 156,
        'Inactive': 67,
        'VIP': 29,
        'Prospect': 89,
        'Partner': 15
      };
      
      const totalContacts = formData.targetTags.reduce((sum, tag) => {
        return sum + (mockContactsPerTag[tag as keyof typeof mockContactsPerTag] || 0);
      }, 0);
      
      setContactsCount(Math.max(totalContacts - Math.floor(totalContacts * 0.1), 0)); // Account for overlaps
    } else {
      setContactsCount(0);
    }
  }, [formData.targetTags]);

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

    if (!formData.messageTemplateId) {
      newErrors.messageTemplateId = 'Message template must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const selectedTemplate = messageTemplates.find(t => t.id === formData.messageTemplateId);
    
    const campaignData: Partial<Campaign> = {
      ...formData,
      messageTemplateName: selectedTemplate?.name || '',
      messageTemplateType: selectedTemplate?.type || 'text',
      contactsTargeted: contactsCount
    };

    onSave(campaignData);
  };

  const getSelectedTemplate = () => {
    return messageTemplates.find(t => t.id === formData.messageTemplateId);
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
                className={errors.name ? 'error' : ''}
                placeholder="Enter campaign name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter campaign description (optional)"
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Target Audience</h3>
            
            <div className="form-group">
              <label>Select Tags *</label>
              <div className="tags-grid">
                {availableTags.map(tag => (
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
              
              {contactsCount > 0 && (
                <div className="contacts-preview">
                  <i className="fas fa-users"></i>
                  <span>{contactsCount} contacts will be targeted</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Message Template</h3>
            
            <div className="form-group">
              <label htmlFor="messageTemplateId">Select Template *</label>
              <select
                id="messageTemplateId"
                name="messageTemplateId"
                value={formData.messageTemplateId}
                onChange={handleInputChange}
                className={errors.messageTemplateId ? 'error' : ''}
              >
                <option value="">Choose a message template</option>
                {messageTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.type === 'text-image' ? 'Text + Image' : 'Text'})
                  </option>
                ))}
              </select>
              {errors.messageTemplateId && <span className="error-message">{errors.messageTemplateId}</span>}
            </div>

            {getSelectedTemplate() && (
              <div className="template-preview">
                <h4>Template Preview</h4>
                <div className="preview-card">
                  <div className="preview-header">
                    <span className="template-name">{getSelectedTemplate()?.name}</span>
                    <span>
                    <span className='tag'>
                      {getSelectedTemplate()?.type === 'text-image' ? 'Text + Image' : 'Text'}
                    </span>
                    </span>
                  </div>
                  <div className="preview-content">
                    {getSelectedTemplate()?.content}
                  </div>
                  {getSelectedTemplate()?.type === 'text-image' && (
                    <div className="preview-image-placeholder">
                      <i className="fas fa-image"></i>
                      <span>Image will be included</span>
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
                <span className="summary-label">Contacts Targeted:</span>
                <span className="summary-value">{contactsCount}</span>
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
          <button type="submit" className="save-btn" onClick={handleSubmit}>
            {type === 'create' ? 'Create Campaign' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignModal;

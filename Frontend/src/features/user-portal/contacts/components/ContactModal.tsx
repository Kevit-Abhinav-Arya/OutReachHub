import React, { useState } from 'react';
import './ContactModal.scss';
import type { ContactModalProps } from '../types/contact.types';
import { displayToCreateDto, displayToUpdateDto } from '../types/contact.types';



const ContactModal: React.FC<ContactModalProps> = ({ contact, type, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    phone: contact?.phone || '',
    email: contact?.email || '', 
    company: contact?.company || '',
    tags: contact?.tags || [],
    notes: contact?.notes || ''  
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateName = (firstName: string, lastName: string): string | null => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) return 'Name is required';
    if (fullName.length < 2) return 'Name must be at least 2 characters';
    if (fullName.length > 100) return 'Name must not exceed 100 characters';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    const phoneRegex = /^[6789]\d{9}$/;
    if (!phone.trim()) return 'Phone number is required';
    if (!phoneRegex.test(phone.trim())) return 'Phone number must be a valid 10-digit mobile number starting with 6, 7, 8, or 9';
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
    return null;
  };

  const validateCompany = (company: string): string | null => {
    if (!company.trim()) return 'Company is required';
    if (company.trim().length < 1) return 'Company name is required';
    if (company.trim().length > 100) return 'Company name must not exceed 100 characters';
    return null;
  };

  const validateTags = (tags: string[]): string | null => {
    if (!tags || tags.length === 0) return 'At least one tag is required';
    return null;
  };

  const validateNotes = (notes: string): string | null => {
    if (notes && notes.length > 500) return 'Notes must not exceed 500 characters';
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};


    const isCreate = type === 'add';

    const nameError = validateName(formData.firstName, formData.lastName);
    if (nameError && (isCreate || formData.firstName.trim() || formData.lastName.trim())) {
      newErrors.name = nameError;
    }

    const phoneError = validatePhone(formData.phone);
    if (phoneError && (isCreate || formData.phone.trim())) {
      newErrors.phone = phoneError;
    }

    const emailError = validateEmail(formData.email);
    if (emailError && (isCreate || formData.email.trim())) {
      newErrors.email = emailError;
    }

    const companyError = validateCompany(formData.company);
    if (companyError && (isCreate || formData.company.trim())) {
      newErrors.company = companyError;
    }

    const tagsError = validateTags(formData.tags);
    if (tagsError && (isCreate || formData.tags.length > 0)) {
      newErrors.tags = tagsError;
    }

    const notesError = validateNotes(formData.notes);
    if (notesError) {
      newErrors.notes = notesError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name] || (name === 'firstName' || name === 'lastName') && errors.name) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        if (name === 'firstName' || name === 'lastName') {
          delete newErrors.name;
        }
        return newErrors;
      });
    }
  };

  const handleAddTag = (tagToAdd: string) => {
    if (tagToAdd.trim() && !formData.tags.includes(tagToAdd.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagToAdd.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSave) {
        if (type === 'add') {
          const createDto = displayToCreateDto(formData);
          await onSave(createDto);
        } else if (type === 'edit') {
          const updateDto = displayToUpdateDto(formData);
          await onSave(updateDto);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && contact?.id) {
      onDelete(contact.id);
    }
  };

  const renderViewModal = () => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md view-contact-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Contact Details</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="detail-content contact-details">
            <div className="detail-row">
              <label className="contact-label">Name</label>
              <div className="contact-value">
                <i className="fas fa-user"></i>
                {`${contact?.firstName} ${contact?.lastName}`}
              </div>
            </div>
            <div className="detail-row">
              <label className="contact-label">Phone Number</label>
              <div className="contact-value">
                <i className="fas fa-phone"></i>
                {contact?.phone}
              </div>
            </div>
            {contact?.email && (
              <div className="detail-row">
                <label className="contact-label">Email</label>
                <div className="contact-value">
                  <i className="fas fa-envelope"></i>
                  {contact.email}
                </div>
              </div>
            )}
            {contact?.company && (
              <div className="detail-row">
                <label className="contact-label">Company</label>
                <div className="contact-value">
                  <i className="fas fa-building"></i>
                  {contact.company}
                </div>
              </div>
            )}
            <div className="detail-row">
              <label className="contact-label">Tags</label>
              <div className="contact-tags">
                {contact?.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
            {contact?.notes && (
              <div className="detail-row">
                <label className="contact-label">Notes</label>
                <div className="detail-preview">{contact.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditModal = () => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg edit-contact-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Contact</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form className="modal-form edit-form">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                required
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error' : ''}
                required
              />
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            <div className="form-group full-width">
              <label htmlFor="company">Company*</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className={errors.company ? 'error' : ''}
                required
              />
              {errors.company && <div className="error-message">{errors.company}</div>}
            </div>
            <div className="form-group full-width">
              <label>Tags*</label>
              <div className={`tags-input ${errors.tags ? 'error' : ''}`}>
                <div className="tags-container">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button 
                        type="button"
                        className="remove-tag" 
                        onClick={() => handleRemoveTag(tag)}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                />
              </div>
              {errors.tags && <div className="error-message">{errors.tags}</div>}
            </div>
            <div className="form-group full-width">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className={errors.notes ? 'error' : ''}
                rows={3}
                maxLength={500}
              />
              {errors.notes && <div className="error-message">{errors.notes}</div>}
           
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <div className="modal-actions">
            <button className="btn btn-secondary cancel-btn" onClick={onClose}>Cancel</button>
            <button 
              className="btn btn-primary save-btn" 
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddModal = () => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md add-contact-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><i className="fas fa-user-plus"></i> Add New Contact</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form className="modal-form contact-form">
            <div className="form-group">
              <label htmlFor="firstName">First Name*</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                required
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name*</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number*</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error' : ''}
                required
              />
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address*</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                required
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            <div className="form-group full-width">
              <label htmlFor="company">Company*</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className={errors.company ? 'error' : ''}
                required
              />
              {errors.company && <div className="error-message">{errors.company}</div>}
            </div>
            <div className="form-group full-width">
              <label>Tags*</label>
              <div className={`tags-input ${errors.tags ? 'error' : ''}`}>
                <div className="tags-container">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button 
                        type="button"
                        className="remove-tag" 
                        onClick={() => handleRemoveTag(tag)}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="Add tags and press Enter..."
                />
              </div>
              {errors.tags && <div className="error-message">{errors.tags}</div>}
              <div className="suggested-tags">
                {['Lead', 'Customer', 'Tech', 'Support'].map(tag => (
                  <span 
                    key={tag}
                    className="suggested-tag" 
                    onClick={() => handleAddTag(tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="form-group full-width">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <div className="modal-actions">
            <button className="btn btn-secondary cancel-btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary save-btn" onClick={handleSave}>
              <i className="fas fa-save"></i> Save Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
const renderDeleteModal = () => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="delete-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Delete Contact</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <i className="fas fa-exclamation-triangle warning-icon"></i>
          <p>Are you sure you want to delete</p>
          <div className="contact-name">{`${contact?.firstName} ${contact?.lastName}`}</div>
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="delete-btn" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );

  switch (type) {
    case 'view':
      return renderViewModal();
    case 'edit':
      return renderEditModal();
    case 'delete':
      return renderDeleteModal();
    case 'add':
      return renderAddModal();
    default:
      return null;
  }
};

export default ContactModal;

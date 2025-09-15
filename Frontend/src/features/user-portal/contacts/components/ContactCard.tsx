import React from 'react';
import './ContactCard.scss';
import type { ContactCardProps } from '../types/contact.types';



const ContactCard: React.FC<ContactCardProps> = ({ contact, onAction, canEdit = true }) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="contact-card" data-contact-id={contact.id}>
      <div className="contact-info">
        <div className="contact-avatar">
          {getInitials(contact.firstName, contact.lastName)}
        </div>
        <div className="contact-details">
          <h3>{`${contact.firstName} ${contact.lastName}`}</h3>
          <p className="contact-phone">
            <i className="fas fa-phone"></i> 
            <span>{contact.phone}</span>
          </p>
          {contact.email && (
            <p className="contact-email">
              <i className="fas fa-envelope"></i>
              <span>{contact.email}</span>
            </p>
          )}
          {contact.company && (
            <p className="contact-company">
              <i className="fas fa-building"></i>
              <span>{contact.company}</span>
            </p>
          )}
          <div className="contact-tags">
            {contact.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="contact-actions">
        <button 
          className="action-btn view-btn" 
          title="View Details"
          onClick={() => onAction(contact, 'view')}
        >
          <i className="fas fa-eye"></i>
        </button>
        {canEdit && (
          <>
            <button 
              className="action-btn edit-btn" 
              title="Edit Contact"
              onClick={() => onAction(contact, 'edit')}
            >
              <i className="fas fa-edit"></i>
            </button>
            <button 
              className="action-btn delete-btn" 
              title="Delete Contact"
              onClick={() => onAction(contact, 'delete')}
            >
              <i className="fas fa-trash"></i>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactCard;

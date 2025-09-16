import React, { forwardRef } from 'react';
import './FormField.scss';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showError?: boolean;
  icon?: React.ReactNode;
  helpText?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, showError = true, icon, helpText, className = '', ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className={`form-field ${hasError ? 'form-field--error' : ''} ${className}`}>
        {label && (
          <label htmlFor={props.id} className="form-field__label">
            {label}
            {props.required && <span className="form-field__required">*</span>}
          </label>
        )}
        
        <div className="form-field__input-wrapper">
          {icon && <div className="form-field__icon">{icon}</div>}
          <input
            ref={ref}
            className={`form-field__input ${icon ? 'form-field__input--with-icon' : ''}`}
            {...props}
          />
        </div>
        
        {showError && hasError && (
          <div className="form-field__error">
            <i className="fa-solid fa-triangle-exclamation"></i>
            {error}
          </div>
        )}
        
        {helpText && !hasError && (
          <div className="form-field__help">
            {helpText}
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

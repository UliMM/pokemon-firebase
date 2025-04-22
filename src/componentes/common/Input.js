import React from 'react';
import './Input.css';

const Input = ({ label, value, onChange, placeholder, disabled, type = 'text' }) => {
  return (
    <div className="neon-input-group">
      <label className="neon-input-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="neon-input"
      />
      <span className="neon-input-border"></span>
    </div>
  );
};

export default Input;
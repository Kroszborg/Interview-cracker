import React, { useState, useEffect } from 'react';
import './ConfigScreen.css';

interface ConfigProps {
  onSave: (config: { apiKey: string; language: string }) => void;
  initialConfig?: { apiKey: string; language: string };
}

const ConfigScreen: React.FC<ConfigProps> = ({ onSave, initialConfig }) => {
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey || '');
  const [language, setLanguage] = useState(initialConfig?.language || 'Python');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ apiKey: apiKey.trim(), language });
  };

  return (
    <div className="config-screen">
      <div className="config-container">
        <h2>Configuration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="apiKey">OpenAI API Key</label>
            <div className="api-key-input">
              <input
                type={showApiKey ? "text" : "password"}
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                placeholder="sk-..."
                spellCheck="false"
                autoComplete="off"
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="language">Preferred Language</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
            >
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="C">C</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="save-button">
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigScreen; 
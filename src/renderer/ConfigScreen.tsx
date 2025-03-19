// src/renderer/ConfigScreen.tsx
import React, { useState, useEffect } from "react";
import "./ConfigScreen.css";

interface Config {
  activeService: string;
  openaiApiKey?: string;
  geminiApiKey?: string;
  claudeApiKey?: string;
  language: string;
}

interface ConfigProps {
  onSave: (config: Config) => void;
  initialConfig?: Config;
}

const ConfigScreen: React.FC<ConfigProps> = ({ onSave, initialConfig }) => {
  const [activeService, setActiveService] = useState(
    initialConfig?.activeService || "openai"
  );
  const [openaiApiKey, setOpenaiApiKey] = useState(
    initialConfig?.openaiApiKey || ""
  );
  const [geminiApiKey, setGeminiApiKey] = useState(
    initialConfig?.geminiApiKey || ""
  );
  const [claudeApiKey, setClaudeApiKey] = useState(
    initialConfig?.claudeApiKey || ""
  );
  const [language, setLanguage] = useState(initialConfig?.language || "Python");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: Config = {
      activeService,
      language,
    };

    // Only include API keys that are set
    if (openaiApiKey) config.openaiApiKey = openaiApiKey.trim();
    if (geminiApiKey) config.geminiApiKey = geminiApiKey.trim();
    if (claudeApiKey) config.claudeApiKey = claudeApiKey.trim();

    onSave(config);
  };

  // Get the active API key based on selected service
  const getActiveApiKey = () => {
    switch (activeService) {
      case "openai":
        return openaiApiKey;
      case "gemini":
        return geminiApiKey;
      case "claude":
        return claudeApiKey;
      default:
        return "";
    }
  };

  // Set the active API key based on selected service
  const setActiveApiKey = (value: string) => {
    switch (activeService) {
      case "openai":
        setOpenaiApiKey(value);
        break;
      case "gemini":
        setGeminiApiKey(value);
        break;
      case "claude":
        setClaudeApiKey(value);
        break;
    }
  };

  // Get placeholder text based on selected service
  const getApiPlaceholder = () => {
    switch (activeService) {
      case "openai":
        return "sk-...";
      case "gemini":
        return "AI...";
      case "claude":
        return "sk-ant-...";
      default:
        return "Enter API key";
    }
  };

  // Get link for getting API key based on selected service
  const getApiKeyLink = () => {
    switch (activeService) {
      case "openai":
        return "https://platform.openai.com/account/api-keys";
      case "gemini":
        return "https://aistudio.google.com/app/apikey";
      case "claude":
        return "https://console.anthropic.com/settings/keys";
      default:
        return "#";
    }
  };

  return (
    <div className="config-screen">
      <div className="config-container">
        <h2>Configuration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="activeService">AI Service</label>
            <select
              id="activeService"
              value={activeService}
              onChange={(e) => setActiveService(e.target.value)}
              required
            >
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="gemini">Google Gemini</option>
              <option value="claude">Anthropic Claude</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="apiKey">
              {activeService === "openai"
                ? "OpenAI"
                : activeService === "gemini"
                ? "Google Gemini"
                : "Anthropic Claude"}{" "}
              API Key
            </label>
            <div className="api-key-input">
              <input
                type={showApiKey ? "text" : "password"}
                id="apiKey"
                value={getActiveApiKey()}
                onChange={(e) => setActiveApiKey(e.target.value)}
                required
                placeholder={getApiPlaceholder()}
                spellCheck="false"
                autoComplete="off"
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? "Hide" : "Show"}
              </button>
            </div>
            <div className="api-key-help">
              <a
                href={getApiKeyLink()}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get{" "}
                {activeService === "openai"
                  ? "OpenAI"
                  : activeService === "gemini"
                  ? "Google Gemini"
                  : "Anthropic Claude"}{" "}
                API key
              </a>
            </div>
          </div>

          {/* Option to add fallback API keys */}
          <div className="form-group fallback-keys">
            <label className="fallback-label">
              Fallback API Keys (Optional)
            </label>

            {activeService !== "openai" && (
              <div className="fallback-key-input">
                <label htmlFor="openaiApiKey">OpenAI API Key</label>
                <div className="api-key-input">
                  <input
                    type={showApiKey ? "text" : "password"}
                    id="openaiApiKey"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    placeholder="sk-..."
                    spellCheck="false"
                    autoComplete="off"
                  />
                </div>
              </div>
            )}

            {activeService !== "gemini" && (
              <div className="fallback-key-input">
                <label htmlFor="geminiApiKey">Google Gemini API Key</label>
                <div className="api-key-input">
                  <input
                    type={showApiKey ? "text" : "password"}
                    id="geminiApiKey"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AI..."
                    spellCheck="false"
                    autoComplete="off"
                  />
                </div>
              </div>
            )}

            {activeService !== "claude" && (
              <div className="fallback-key-input">
                <label htmlFor="claudeApiKey">Anthropic Claude API Key</label>
                <div className="api-key-input">
                  <input
                    type={showApiKey ? "text" : "password"}
                    id="claudeApiKey"
                    value={claudeApiKey}
                    onChange={(e) => setClaudeApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                    spellCheck="false"
                    autoComplete="off"
                  />
                </div>
              </div>
            )}
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

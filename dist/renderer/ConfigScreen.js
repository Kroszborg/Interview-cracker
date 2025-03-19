"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/renderer/ConfigScreen.tsx
const react_1 = __importStar(require("react"));
require("./ConfigScreen.css");
const ConfigScreen = ({ onSave, initialConfig }) => {
    const [activeService, setActiveService] = (0, react_1.useState)(initialConfig?.activeService || "openai");
    const [openaiApiKey, setOpenaiApiKey] = (0, react_1.useState)(initialConfig?.openaiApiKey || "");
    const [geminiApiKey, setGeminiApiKey] = (0, react_1.useState)(initialConfig?.geminiApiKey || "");
    const [claudeApiKey, setClaudeApiKey] = (0, react_1.useState)(initialConfig?.claudeApiKey || "");
    const [language, setLanguage] = (0, react_1.useState)(initialConfig?.language || "Python");
    const [showApiKey, setShowApiKey] = (0, react_1.useState)(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        const config = {
            activeService,
            language,
        };
        // Only include API keys that are set
        if (openaiApiKey)
            config.openaiApiKey = openaiApiKey.trim();
        if (geminiApiKey)
            config.geminiApiKey = geminiApiKey.trim();
        if (claudeApiKey)
            config.claudeApiKey = claudeApiKey.trim();
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
    const setActiveApiKey = (value) => {
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
    return (react_1.default.createElement("div", { className: "config-screen" },
        react_1.default.createElement("div", { className: "config-container" },
            react_1.default.createElement("h2", null, "Configuration"),
            react_1.default.createElement("form", { onSubmit: handleSubmit },
                react_1.default.createElement("div", { className: "form-group" },
                    react_1.default.createElement("label", { htmlFor: "activeService" }, "AI Service"),
                    react_1.default.createElement("select", { id: "activeService", value: activeService, onChange: (e) => setActiveService(e.target.value), required: true },
                        react_1.default.createElement("option", { value: "openai" }, "OpenAI (GPT-4o)"),
                        react_1.default.createElement("option", { value: "gemini" }, "Google Gemini"),
                        react_1.default.createElement("option", { value: "claude" }, "Anthropic Claude"))),
                react_1.default.createElement("div", { className: "form-group" },
                    react_1.default.createElement("label", { htmlFor: "apiKey" },
                        activeService === "openai"
                            ? "OpenAI"
                            : activeService === "gemini"
                                ? "Google Gemini"
                                : "Anthropic Claude",
                        " ",
                        "API Key"),
                    react_1.default.createElement("div", { className: "api-key-input" },
                        react_1.default.createElement("input", { type: showApiKey ? "text" : "password", id: "apiKey", value: getActiveApiKey(), onChange: (e) => setActiveApiKey(e.target.value), required: true, placeholder: getApiPlaceholder(), spellCheck: "false", autoComplete: "off" }),
                        react_1.default.createElement("button", { type: "button", className: "toggle-visibility", onClick: () => setShowApiKey(!showApiKey) }, showApiKey ? "Hide" : "Show")),
                    react_1.default.createElement("div", { className: "api-key-help" },
                        react_1.default.createElement("a", { href: getApiKeyLink(), target: "_blank", rel: "noopener noreferrer" },
                            "Get",
                            " ",
                            activeService === "openai"
                                ? "OpenAI"
                                : activeService === "gemini"
                                    ? "Google Gemini"
                                    : "Anthropic Claude",
                            " ",
                            "API key"))),
                react_1.default.createElement("div", { className: "form-group fallback-keys" },
                    react_1.default.createElement("label", { className: "fallback-label" }, "Fallback API Keys (Optional)"),
                    activeService !== "openai" && (react_1.default.createElement("div", { className: "fallback-key-input" },
                        react_1.default.createElement("label", { htmlFor: "openaiApiKey" }, "OpenAI API Key"),
                        react_1.default.createElement("div", { className: "api-key-input" },
                            react_1.default.createElement("input", { type: showApiKey ? "text" : "password", id: "openaiApiKey", value: openaiApiKey, onChange: (e) => setOpenaiApiKey(e.target.value), placeholder: "sk-...", spellCheck: "false", autoComplete: "off" })))),
                    activeService !== "gemini" && (react_1.default.createElement("div", { className: "fallback-key-input" },
                        react_1.default.createElement("label", { htmlFor: "geminiApiKey" }, "Google Gemini API Key"),
                        react_1.default.createElement("div", { className: "api-key-input" },
                            react_1.default.createElement("input", { type: showApiKey ? "text" : "password", id: "geminiApiKey", value: geminiApiKey, onChange: (e) => setGeminiApiKey(e.target.value), placeholder: "AI...", spellCheck: "false", autoComplete: "off" })))),
                    activeService !== "claude" && (react_1.default.createElement("div", { className: "fallback-key-input" },
                        react_1.default.createElement("label", { htmlFor: "claudeApiKey" }, "Anthropic Claude API Key"),
                        react_1.default.createElement("div", { className: "api-key-input" },
                            react_1.default.createElement("input", { type: showApiKey ? "text" : "password", id: "claudeApiKey", value: claudeApiKey, onChange: (e) => setClaudeApiKey(e.target.value), placeholder: "sk-ant-...", spellCheck: "false", autoComplete: "off" }))))),
                react_1.default.createElement("div", { className: "form-group" },
                    react_1.default.createElement("label", { htmlFor: "language" }, "Preferred Language"),
                    react_1.default.createElement("select", { id: "language", value: language, onChange: (e) => setLanguage(e.target.value), required: true },
                        react_1.default.createElement("option", { value: "Python" }, "Python"),
                        react_1.default.createElement("option", { value: "JavaScript" }, "JavaScript"),
                        react_1.default.createElement("option", { value: "TypeScript" }, "TypeScript"),
                        react_1.default.createElement("option", { value: "Java" }, "Java"),
                        react_1.default.createElement("option", { value: "C++" }, "C++"),
                        react_1.default.createElement("option", { value: "C" }, "C"),
                        react_1.default.createElement("option", { value: "Go" }, "Go"),
                        react_1.default.createElement("option", { value: "Rust" }, "Rust"))),
                react_1.default.createElement("div", { className: "form-actions" },
                    react_1.default.createElement("button", { type: "submit", className: "save-button" }, "Save Configuration"))))));
};
exports.default = ConfigScreen;

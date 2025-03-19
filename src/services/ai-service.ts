// src/services/ai-service.ts
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

// AI Client interfaces
interface AIClientConfig {
  apiKey: string;
}

interface AIServiceResponse {
  approach: string;
  code: string;
  timeComplexity: string;
  spaceComplexity: string;
}

// Base AI Service class
abstract class AIService {
  protected apiKey: string;
  protected language: string;

  constructor(config: AIClientConfig, language: string) {
    this.apiKey = config.apiKey;
    this.language = language;
  }

  abstract processScreenshots(screenshots: { path: string }[]): Promise<AIServiceResponse>;
}

// OpenAI Implementation
class OpenAIService extends AIService {
  private client: OpenAI;

  constructor(config: AIClientConfig, language: string) {
    super(config, language);
    this.client = new OpenAI({
      apiKey: this.apiKey.trim(),
    });
  }

  async processScreenshots(screenshots: { path: string }[]): Promise<AIServiceResponse> {
    try {
      const systemMessage = {
        role: "system" as const,
        content: `You are an expert coding interview assistant. Analyze the coding question from the screenshots and provide a solution in ${this.language}.
                 Return the response in the following JSON format:
                 {
                   "approach": "Detailed approach to solve the problem on how are we solving the problem, that the interviewee will speak out loud and in easy explainatory words",
                   "code": "The complete solution code",
                   "timeComplexity": "Big O analysis of time complexity with the reason",
                   "spaceComplexity": "Big O analysis of space complexity with the reason"
                 }`
      };

      const userTextMessage = {
        role: "user" as const,
        content: "Here is a coding interview question. Please analyze and provide a solution."
      };

      // Prepare messages array
      const messages: Array<any> = [systemMessage];
      
      // Add initial user text message
      messages.push(userTextMessage);

      // Add screenshots as image URLs
      for (const screenshot of screenshots) {
        const base64Image = await fs.readFile(screenshot.path, { encoding: 'base64' });
        messages.push({
          role: "user" as const,
          content: [
            {
              type: "image_url" as const,
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        });
      }

      // Get response from OpenAI
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content || '{}';
      return JSON.parse(content) as AIServiceResponse;
    } catch (error) {
      console.error('Error processing screenshots with OpenAI:', error);
      throw error;
    }
  }
}

// Google Gemini Implementation with enhanced response cleaning
class GeminiService extends AIService {
  private client: any;

  constructor(config: AIClientConfig, language: string) {
    super(config, language);
    this.client = new GoogleGenerativeAI(this.apiKey.trim());
  }

  async processScreenshots(screenshots: { path: string }[]): Promise<AIServiceResponse> {
    try {
      const genAI = this.client;
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Prompt designed to make Gemini structure output similarly to OpenAI's JSON format
      const prompt = `You are an expert coding interview assistant. Analyze the coding question from the screenshots and provide a solution in ${this.language}.
      
      Your response must be in this EXACT format (match the format exactly, don't add any other sections):

      APPROACH:
      [A detailed explanation of how to approach the problem, written clearly and step by step]

      CODE:
      [Complete solution code with NO line numbers, NO markdown formatting, NO triple backticks]

      TIME_COMPLEXITY:
      [Brief explanation of time complexity with the Big O notation]

      SPACE_COMPLEXITY:
      [Brief explanation of space complexity with the Big O notation]

      IMPORTANT: DO NOT include line numbers in your code. DO NOT use markdown formatting. Keep the sections cleanly separated with the exact section headings provided.`;

      // Prepare images
      const imagePromises = screenshots.map(async (screenshot) => {
        const imageData = await fs.readFile(screenshot.path);
        return {
          inlineData: {
            data: imageData.toString('base64'),
            mimeType: "image/png"
          }
        };
      });

      const images = await Promise.all(imagePromises);

      // Make the request
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              ...images.map(img => ({ inlineData: img.inlineData }))
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      });

      // Get the response text
      const responseText = result.response.text();
      
      // Clean and process the response
      
      // 1. Extract the four sections using clear markers
      const approachRegex = /APPROACH:\s*([\s\S]*?)(?=CODE:|$)/i;
      const codeRegex = /CODE:\s*([\s\S]*?)(?=TIME_COMPLEXITY:|$)/i;
      const timeRegex = /TIME_COMPLEXITY:\s*([\s\S]*?)(?=SPACE_COMPLEXITY:|$)/i;
      const spaceRegex = /SPACE_COMPLEXITY:\s*([\s\S]*?)(?=$)/i;
      
      const approachMatch = responseText.match(approachRegex);
      const codeMatch = responseText.match(codeRegex);
      const timeMatch = responseText.match(timeRegex);
      const spaceMatch = responseText.match(spaceRegex);
      
      // 2. Clean up each section
      let approach = approachMatch && approachMatch[1] ? approachMatch[1].trim() : "Could not extract approach";
      
      let code = "Could not extract code";
      if (codeMatch && codeMatch[1]) {
        code = codeMatch[1]
          .replace(/```[\w]*\n|```/g, '') // Remove code block markers
          .replace(/^\s*\d+[\.:\s]*/gm, '') // Remove line numbers at start of lines
          .replace(/\n\s*\d+[\.:\s]*/g, '\n') // Remove line numbers after newlines
          .trim();
      }
      
      let timeComplexity = timeMatch && timeMatch[1] ? timeMatch[1].trim() : "Could not extract time complexity";
      let spaceComplexity = spaceMatch && spaceMatch[1] ? spaceMatch[1].trim() : "Could not extract space complexity";
      
      // 3. Format the final response object similar to OpenAI's format
      return {
        approach,
        code,
        timeComplexity,
        spaceComplexity
      };
    } catch (error) {
      console.error('Error processing screenshots with Gemini:', error);
      throw error;
    }
  }
}

// Claude Implementation
class ClaudeService extends AIService {
  private client: Anthropic;

  constructor(config: AIClientConfig, language: string) {
    super(config, language);
    this.client = new Anthropic({
      apiKey: this.apiKey.trim(),
    });
  }

  async processScreenshots(screenshots: { path: string }[]): Promise<AIServiceResponse> {
    try {
      // Claude API - Using a different approach without relying on specific types
      const systemPrompt = `You are an expert coding interview assistant. Analyze the coding question from the screenshots and provide a solution in ${this.language}.
                           Return the response in the following JSON format:
                           {
                             "approach": "Detailed approach to solve the problem on how are we solving the problem, that the interviewee will speak out loud and in easy explainatory words",
                             "code": "The complete solution code",
                             "timeComplexity": "Big O analysis of time complexity with the reason",
                             "spaceComplexity": "Big O analysis of space complexity with the reason"
                           }`;
      
      // For Claude, we'll use Claude's built in vision capability
      // Prepare content array with text and images
      const content = [];
      
      // Add the text instruction first
      content.push({
        type: "text",
        text: "Here is a coding interview question. Please analyze and provide a solution."
      });
      
      // Add images
      for (const screenshot of screenshots) {
        const imageData = await fs.readFile(screenshot.path);
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: "image/png",
            data: imageData.toString('base64')
          }
        });
      }

      // Make API request - we're using 'any' type here to bypass TypeScript checking
      const response = await this.client.messages.create({
        model: "claude-3-opus-20240229",
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: content as any
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      // Extract and parse the response
      let responseText = "";
      
      // Handle the response content safely
      if (response.content && response.content.length > 0) {
        const firstBlock = response.content[0];
        
        // Check if the content has a text property
        if (typeof firstBlock === 'object' && firstBlock !== null && 'text' in firstBlock) {
          responseText = firstBlock.text as string;
        }
      }
      
      if (!responseText) {
        throw new Error('Empty or invalid response from Claude');
      }
      
      try {
        // Try to find and parse JSON in the response
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        responseText.match(/{[\s\S]*}/);
                          
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]) as AIServiceResponse;
        } 
        
        // If no JSON found, try to extract structured data
        const approachMatch = responseText.match(/Approach:?\s*([\s\S]*?)(?:Code:|$)/i);
        const approach = approachMatch ? approachMatch[1].trim() : "Could not extract approach";
        
        const codeMatch = responseText.match(/Code:?\s*([\s\S]*?)(?:Time Complexity:|$)/i);
        const code = codeMatch ? codeMatch[1].trim() : "Could not extract code";
        
        const timeMatch = responseText.match(/Time Complexity:?\s*([\s\S]*?)(?:Space Complexity:|$)/i);
        const timeComplexity = timeMatch ? timeMatch[1].trim() : "Could not extract time complexity";
        
        const spaceMatch = responseText.match(/Space Complexity:?\s*([\s\S]*?)(?:$)/i);
        const spaceComplexity = spaceMatch ? spaceMatch[1].trim() : "Could not extract space complexity";
        
        return {
          approach,
          code,
          timeComplexity,
          spaceComplexity
        };
      } catch (parseError) {
        console.error('Error parsing Claude response:', parseError);
        throw new Error('Failed to parse Claude response');
      }
    } catch (error) {
      console.error('Error processing screenshots with Claude:', error);
      throw error;
    }
  }
}

// Factory class to create the appropriate AI service
class AIServiceFactory {
  static createService(type: string, config: { apiKey: string; language: string }): AIService {
    switch (type.toLowerCase()) {
      case 'openai':
        return new OpenAIService({ apiKey: config.apiKey }, config.language);
      case 'gemini':
        return new GeminiService({ apiKey: config.apiKey }, config.language);
      case 'claude':
        return new ClaudeService({ apiKey: config.apiKey }, config.language);
      default:
        throw new Error(`Unsupported AI service type: ${type}`);
    }
  }
}

// Main exported service
export interface AIConfig {
  activeService: string;
  openaiApiKey?: string;
  geminiApiKey?: string;
  claudeApiKey?: string;
  language: string;
}

let currentConfig: AIConfig | null = null;
let activeService: AIService | null = null;

export function updateConfig(config: AIConfig): void {
  if (!config.activeService) {
    throw new Error('Active service must be specified');
  }
  
  // Get the API key for the active service
  let apiKey: string | undefined;
  switch (config.activeService.toLowerCase()) {
    case 'openai':
      apiKey = config.openaiApiKey;
      break;
    case 'gemini':
      apiKey = config.geminiApiKey;
      break;
    case 'claude':
      apiKey = config.claudeApiKey;
      break;
  }
  
  if (!apiKey) {
    throw new Error(`API key for ${config.activeService} is required`);
  }
  
  try {
    activeService = AIServiceFactory.createService(
      config.activeService, 
      { 
        apiKey, 
        language: config.language || 'Python' 
      }
    );
    currentConfig = config;
    console.log(`AI service initialized: ${config.activeService}`);
  } catch (error) {
    console.error(`Error initializing AI service ${config.activeService}:`, error);
    throw error;
  }
}

export async function processScreenshots(screenshots: { path: string }[]): Promise<AIServiceResponse> {
  if (!activeService) {
    throw new Error('AI service not initialized. Please configure API key first.');
  }

  try {
    return await activeService.processScreenshots(screenshots);
  } catch (error) {
    console.error('Error processing screenshots:', error);
    
    // If we have fallback services configured, try them
    if (currentConfig) {
      const fallbackServices = ['openai', 'gemini', 'claude'].filter(
        service => service !== currentConfig!.activeService.toLowerCase()
      );
      
      for (const service of fallbackServices) {
        let apiKey: string | undefined;
        switch (service) {
          case 'openai':
            apiKey = currentConfig.openaiApiKey;
            break;
          case 'gemini':
            apiKey = currentConfig.geminiApiKey;
            break;
          case 'claude':
            apiKey = currentConfig.claudeApiKey;
            break;
        }
        
        if (apiKey) {
          try {
            console.log(`Trying fallback service: ${service}`);
            const fallbackService = AIServiceFactory.createService(
              service, 
              { 
                apiKey, 
                language: currentConfig.language 
              }
            );
            return await fallbackService.processScreenshots(screenshots);
          } catch (fallbackError) {
            console.error(`Error with fallback service ${service}:`, fallbackError);
          }
        }
      }
    }
    
    // If all fallbacks fail, rethrow the original error
    throw error;
  }
}

export default {
  processScreenshots,
  updateConfig
};
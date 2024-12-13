import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from "openai";
import { CustomLoggerService } from '../../common/services/custom-logger.service';


@Injectable()
export class OpenAiService {

  constructor(
    private configService: ConfigService,
    private customLoggerService: CustomLoggerService
  ) { }

  async generateResponse(userMessage: string, systemContext: string): Promise<any> {
    try {

      const openai = new OpenAI({
        apiKey: this.configService.get('OPENAI_API_KEY'),
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemContext  // Example: "You are a thoughtful and empathetic assistant."
          },
          {
            "role": "user",
            "content": userMessage
          }
        ],
        temperature: 1,
        max_tokens: 512,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      return response.choices[0].message.content; // Returning just the content of the assistant's response
    } catch (error) {
      this.customLoggerService.error('Error calling OpenAI API:', error);
      throw new Error('Failed to communicate with OpenAI API');
    }
  }
}
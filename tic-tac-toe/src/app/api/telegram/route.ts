/**
 * Telegram Bot Webhook Handler
 * 
 * POST /api/telegram
 * 
 * Receives webhook updates from Telegram and handles bot commands.
 * This endpoint should be set as the webhook URL in Telegram Bot API.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Telegram webhook update structure.
 */
interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
}

/**
 * Telegram Bot API response structure.
 */
interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
  };
  error_code?: number;
  description?: string;
}

/**
 * Sends a message to Telegram via Bot API.
 * 
 * @param botToken - Telegram bot token
 * @param chatId - Chat ID to send message to
 * @param text - Message text
 * @param replyMarkup - Optional inline keyboard markup
 * @returns Promise with Telegram API response
 */
async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
  replyMarkup?: {
    inline_keyboard: Array<Array<{ text: string; web_app: { url: string } }>>;
  }
): Promise<TelegramResponse> {
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(telegramUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...(replyMarkup && { reply_markup: replyMarkup }),
    }),
  });

  return response.json();
}

/**
 * Handles the /start command.
 * 
 * @param botToken - Telegram bot token
 * @param chatId - Chat ID of the user
 * @param from - User information
 */
async function handleStartCommand(
  botToken: string,
  chatId: number
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    console.error('NEXT_PUBLIC_APP_URL is not configured');
    // Send message without button if URL is not configured
    await sendTelegramMessage(
      botToken,
      chatId,
      'Добро пожаловать в игру Tic-Tac-Toe! 🎮\n\nИграйте в крестики-нолики и получайте промокоды за победы!'
    );
    return;
  }

  const welcomeMessage =
    'Добро пожаловать в игру Tic-Tac-Toe! 🎮\n\nИграйте в крестики-нолики и получайте промокоды за победы!';

  // Create inline keyboard with web_app button
  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: 'Играть в игру',
          web_app: {
            url: appUrl,
          },
        },
      ],
    ],
  };

  try {
    const response = await sendTelegramMessage(
      botToken,
      chatId,
      welcomeMessage,
      replyMarkup
    );

    if (!response.ok) {
      console.error('Failed to send /start response:', response);
    }
  } catch (error) {
    console.error('Error sending /start response:', error);
  }
}

/**
 * POST handler for Telegram webhook updates.
 * 
 * @param request - Next.js request object containing Telegram update
 * @returns 200 OK response
 */
export async function POST(request: NextRequest) {
  try {
    // Parse Telegram webhook update
    const update: TelegramUpdate = await request.json();

    // Log all received updates
    console.log('Received Telegram update:', JSON.stringify(update, null, 2));

    // Get bot token from environment
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN is not configured');
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Process message if present
    const message = update.message;
    if (message) {
      const { text, chat, from } = message;
      const chatId = chat.id;

      // Log message details
      console.log('Message details:', {
        chatId,
        from: from ? { id: from.id, name: from.first_name } : null,
        text,
      });

      // Handle /start command
      if (text === '/start') {
        await handleStartCommand(botToken, chatId);
      } else if (text) {
        // Handle other text messages (optional)
        console.log(`Received text message: "${text}" from chat ${chatId}`);
        // You can add more command handlers here if needed
      }
    }

    // Always return 200 OK to acknowledge receipt of update
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    // Log error but still return 200 OK to prevent Telegram from retrying
    console.error('Error processing Telegram webhook:', error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}


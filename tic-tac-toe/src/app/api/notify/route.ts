/**
 * Telegram Notification API Route
 * 
 * POST /api/notify
 * 
 * Sends game result notifications to Telegram via the Bot API.
 * This is a server-side endpoint that securely uses environment variables.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Request body structure for the notification endpoint.
 */
interface NotificationRequestBody {
  userId: number;
  status: 'win' | 'lose';
  promoCode?: string;
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
 * POST handler for Telegram notifications.
 * 
 * @param request - Next.js request object containing JSON body
 * @returns JSON response with success status
 * 
 * @example
 * POST /api/notify
 * Body: { "userId": 123456789, "status": "win", "promoCode": "A7K3D" }
 * Response: { "success": true, "message": "Notification sent" }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: NotificationRequestBody = await request.json();
    const { userId, status, promoCode } = body;

    // Validate required fields
    if (!userId || typeof userId !== 'number') {
      console.error('Invalid or missing userId in notification request');
      return NextResponse.json(
        { success: true, message: 'Invalid userId, but continuing' },
        { status: 200 }
      );
    }

    if (!status || (status !== 'win' && status !== 'lose')) {
      console.error('Invalid status in notification request:', status);
      return NextResponse.json(
        { success: true, message: 'Invalid status, but continuing' },
        { status: 200 }
      );
    }

    // Validate promoCode for win status
    if (status === 'win' && !promoCode) {
      console.warn('Win status provided without promoCode');
    }

    // Get bot token from environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // Check if bot token is set
    if (!botToken) {
      console.error(
        'Telegram bot token not configured. Missing TELEGRAM_BOT_TOKEN'
      );
      // Still return success to not break game UX
      return NextResponse.json({
        success: true,
        message: 'Telegram not configured',
      });
    }

    // Build message text based on status
    let messageText: string;
    if (status === 'win' && promoCode) {
      messageText = `Победа! Промокод выдан: ${promoCode}`;
    } else if (status === 'win') {
      messageText = 'Победа!';
    } else {
      messageText = 'Проигрыш';
    }

    // Send message to Telegram via Bot API
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
      const telegramResponse = await fetch(telegramUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: userId,
          text: messageText,
        }),
      });

      const telegramData: TelegramResponse = await telegramResponse.json();

      if (!telegramData.ok) {
        console.error(
          'Telegram API error:',
          telegramData.error_code,
          telegramData.description
        );
        // Still return success to not break game UX
        return NextResponse.json({
          success: true,
          message: 'Telegram API error, but continuing',
        });
      }

      // Success
      return NextResponse.json({
        success: true,
        message: 'Notification sent successfully',
      });
    } catch (fetchError) {
      // Network or fetch error
      console.error('Failed to send Telegram notification:', fetchError);
      // Still return success to not break game UX
      return NextResponse.json({
        success: true,
        message: 'Network error, but continuing',
      });
    }
  } catch (error) {
    // JSON parsing or other errors
    console.error('Error processing notification request:', error);
    // Always return success to not break game UX
    return NextResponse.json({
      success: true,
      message: 'Request error, but continuing',
    });
  }
}


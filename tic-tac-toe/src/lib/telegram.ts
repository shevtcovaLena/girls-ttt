/**
 * Telegram Notification Utility
 * 
 * Sends game result notifications to Telegram via the API endpoint.
 * This is a client-side function that calls the Next.js API route handler.
 * 
 * Note: The actual Telegram bot token and chat ID are stored server-side
 * in environment variables and never exposed to the client.
 */

/**
 * Status of the game result for notification purposes.
 */
export type GameStatus = 'win' | 'lose';

/**
 * Request body structure for the notification API endpoint.
 */
interface NotificationRequest {
  userId: number;
  status: GameStatus;
  promoCode?: string;
}

/**
 * Sends a Telegram notification about the game result.
 * 
 * This function calls the `/api/notify` endpoint which handles the actual
 * Telegram API communication server-side. Errors are logged but not thrown
 * to ensure the game UX is not interrupted.
 * 
 * @param userId - Telegram user ID (chat_id) to send notification to
 * @param status - The game result: 'win' for player victory, 'lose' for defeat
 * @param promoCode - Optional promo code (required when status is 'win')
 * 
 * @returns Promise that resolves when the request is sent (not waiting for response)
 * 
 * @example
 * // Player wins - send notification with promo code
 * await sendTelegramNotification(123456789, 'win', 'A7K3D');
 * // Sends: "Победа! Промокод выдан: A7K3D"
 * 
 * @example
 * // Player loses - send notification without promo code
 * await sendTelegramNotification(123456789, 'lose');
 * // Sends: "Проигрыш"
 * 
 * @example
 * // Error handling is automatic - game continues even if notification fails
 * await sendTelegramNotification(123456789, 'win', 'X9Q2B');
 * // If API fails, error is logged to console but no exception is thrown
 */
export async function sendTelegramNotification(
  userId: number,
  status: GameStatus,
  promoCode?: string
): Promise<void> {
  // Validate userId
  if (!userId || typeof userId !== 'number') {
    console.warn('sendTelegramNotification: userId is required and must be a number');
    return;
  }

  // Validate that promoCode is provided when status is 'win'
  if (status === 'win' && !promoCode) {
    console.warn(
      'sendTelegramNotification: promoCode is required when status is "win"'
    );
  }

  // Prepare request body
  const body: NotificationRequest = {
    userId,
    status,
    ...(promoCode && { promoCode }),
  };

  try {
    // Call the API endpoint (fire and forget - don't await response)
    fetch('/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).catch((error) => {
      // Log error but don't throw - game should continue normally
      console.error('Failed to send Telegram notification:', error);
    });

    // Return immediately without waiting for response
    // This ensures the game UX is not blocked by network delays
  } catch (error) {
    // Catch any synchronous errors (shouldn't happen with fetch, but just in case)
    console.error('Error preparing Telegram notification:', error);
    // Don't throw - silently fail to preserve game experience
  }
}


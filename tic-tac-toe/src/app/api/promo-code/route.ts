/**
 * Promo Code Generation API Route
 * 
 * GET /api/promo-code
 * 
 * Generates a random 5-character promotional code on the server side.
 * Used when a player wins the game.
 */

import { NextResponse } from 'next/server';

/**
 * Generates a random 5-character promotional code.
 * 
 * The code consists of uppercase letters (A-Z) and digits (0-9).
 * Each call generates a unique code with high probability.
 * 
 * @returns A 5-character string containing letters and numbers
 */
function generatePromoCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 5;
  let code = '';

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

/**
 * GET handler for promo code generation.
 * 
 * @returns JSON response with generated promo code
 * 
 * @example
 * GET /api/promo-code
 * Response: { "promoCode": "A7K3D" }
 */
export async function GET() {
  try {
    const promoCode = generatePromoCode();
    
    return NextResponse.json(
      { promoCode },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to generate promo code' },
      { status: 500 }
    );
  }
}


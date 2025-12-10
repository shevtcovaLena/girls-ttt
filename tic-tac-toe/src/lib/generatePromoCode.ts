/**
 * Promo Code Generation Utility
 * 
 * Generates random 5-character promotional codes using uppercase letters (A-Z)
 * and digits (0-9) for use when the player wins the game.
 */

/**
 * Generates a random 5-character promotional code.
 * 
 * The code consists of uppercase letters (A-Z) and digits (0-9).
 * Each call generates a unique code with high probability.
 * 
 * @returns A 5-character string containing letters and numbers
 * 
 * @example
 * generatePromoCode(); // Returns: "A7K3D"
 * generatePromoCode(); // Returns: "X9Q2B"
 * generatePromoCode(); // Returns: "M4R8L"
 */
export function generatePromoCode(): string {
  // Characters pool: uppercase letters A-Z (26 chars) and digits 0-9 (10 chars)
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 5;
  let code = '';

  // Generate each character randomly from the pool
  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}


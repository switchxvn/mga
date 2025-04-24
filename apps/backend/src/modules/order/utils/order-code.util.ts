import { customAlphabet } from 'nanoid';

const NUMERIC = '0123456789';
const nanoid = customAlphabet(NUMERIC, 6);

export function generateOrderCode(): string {
  const timestamp = Date.now();
  const randomNum = nanoid();
  
  // Combine timestamp with random numbers, but ensure it's not longer than 16 digits
  // to stay within MAX_SAFE_INTEGER (which is 9007199254740991)
  const orderCode = `${timestamp}${randomNum}`.slice(0, 16);
  
  return orderCode;
} 
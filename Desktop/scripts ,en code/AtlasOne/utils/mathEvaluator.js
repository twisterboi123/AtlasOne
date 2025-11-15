import { evaluate } from 'mathjs';

// Safely evaluate math by restricting characters.
export function safeEvaluate(expr) {
  if (!expr) return { error: 'Empty expression' };
  const allowed = /^[0-9+\-*/().,^% sqrt\s]+$/i;
  if (!allowed.test(expr)) return { error: 'Invalid characters detected.' };
  try {
    const result = evaluate(expr);
    return { result };
  } catch (e) {
    return { error: e.message };
  }
}

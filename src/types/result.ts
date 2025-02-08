export type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

// Type guard helper
export function isError<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success;
} 
export interface AuraErrorResponse {
  jsonrpc: string;
  error: {
    code: number;
    message: string;
  };
  id: string | number;
}

export class AuraError extends Error {
  public code: number;
  public jsonrpc: string;
  public id: string | number;

  constructor(response: AuraErrorResponse) {
    super(response.error.message);
    this.name = 'AuraError';
    this.code = response.error.code;
    this.jsonrpc = response.jsonrpc;
    this.id = response.id;
  }

  static isAuraErrorResponse(obj: any): obj is AuraErrorResponse {
    return (
      obj &&
      obj.jsonrpc === '2.0' &&
      obj.error &&
      typeof obj.error.code === 'number' &&
      typeof obj.error.message === 'string'
    );
  }
}

export const ERROR_CODES = {
  INVALID_PUBKEY: -32000,
  RATE_LIMIT_EXCEEDED: -32001,
  INVALID_PARAMETER: -32602,
  METHOD_NOT_FOUND: -32601,
  INTERNAL_ERROR: -32603,
} as const;

export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_PUBKEY]: 'Invalid public key provided',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  [ERROR_CODES.INVALID_PARAMETER]: 'Invalid parameter provided',
  [ERROR_CODES.METHOD_NOT_FOUND]: 'Method not found',
  [ERROR_CODES.INTERNAL_ERROR]: 'Internal server error',
} as const; 
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, message: string, code = 'ERROR', details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(msg = 'Bad request', details?: unknown) {
    return new ApiError(400, msg, 'BAD_REQUEST', details);
  }
  static unauthorized(msg = 'Unauthorized') {
    return new ApiError(401, msg, 'UNAUTHORIZED');
  }
  static forbidden(msg = 'Forbidden') {
    return new ApiError(403, msg, 'FORBIDDEN');
  }
  static notFound(msg = 'Not found') {
    return new ApiError(404, msg, 'NOT_FOUND');
  }
  static conflict(msg = 'Conflict') {
    return new ApiError(409, msg, 'CONFLICT');
  }
  static unprocessable(msg = 'Unprocessable entity', details?: unknown) {
    return new ApiError(422, msg, 'UNPROCESSABLE', details);
  }
  static tooMany(msg = 'Too many requests') {
    return new ApiError(429, msg, 'RATE_LIMITED');
  }
  static server(msg = 'Internal error') {
    return new ApiError(500, msg, 'INTERNAL');
  }
}

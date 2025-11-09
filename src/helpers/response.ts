import { Response } from 'express';

class ResponseApi {
  static success<T>(response: Response, message: string, status: number = 200, data: T = {} as T) {
    return response.status(status).json({
      meta: {
        status,
        message,
      },
      data: data,
      error: null,
    });
  }

  static error(response: Response, message: string, status: number = 500, error: Record<string, any> = {}) {
    return response.status(status).json({
      meta: {
        status,
        message,
      },
      data: null,
      error,
    });
  }

  static notFound = (res: Response, message: string = 'Not Found !!!', statusCode: number = 404) => {
    return res.status(statusCode).json({
      meta: {
        status: statusCode,
        message: message,
      },
    });
  };
}
export default ResponseApi;

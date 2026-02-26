import { sendSuccess, sendError } from '@/utils/response';
import type { Response } from 'express';

function mockResponse(): jest.Mocked<Response> {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as jest.Mocked<Response>;
  return res;
}

describe('Response Utils', () => {
  describe('sendSuccess', () => {
    it('should return standard success format with 200', () => {
      const res = mockResponse();
      sendSuccess(res, { id: '1' }, 'OK');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'OK',
        data: { id: '1' },
      });
    });

    it('should support custom status code', () => {
      const res = mockResponse();
      sendSuccess(res, null, 'Created', 201);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('sendError', () => {
    it('should return standard error format with 500', () => {
      const res = mockResponse();
      sendError(res, 'Something went wrong');

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Something went wrong',
      });
    });

    it('should include error details when provided', () => {
      const res = mockResponse();
      sendError(res, 'Bad input', 422, { field: 'email' });

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Bad input',
        error: { field: 'email' },
      });
    });
  });
});

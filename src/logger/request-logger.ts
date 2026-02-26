import pinoHttp from 'pino-http';
import { logger } from './index';

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req) => {
    const requestId = (req as { requestId?: string }).requestId;
    return typeof requestId === 'string' ? requestId : 'unknown';
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      remoteAddress: req.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

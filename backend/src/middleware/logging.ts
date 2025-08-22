import morgan from 'morgan';
import { logger } from '../utils/logger';

// Custom token for user ID
morgan.token('user', (req: any) => {
  return req.user ? req.user.userId : 'anonymous';
});

// Custom format
const logFormat = ':remote-addr - :user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

export const httpLogger = morgan(logFormat, {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    },
  },
});
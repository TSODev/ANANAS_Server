import { Request, Response, NextFunction } from 'express';
import l from './logger';

export function httpLogger(req: Request, res: Response, next: NextFunction) {
  //     if (req.method !=='OPTIONS') {

  //     }
  if (process.env.NODE_ENV === 'development') {
    l.debug('[HTTPLOGGER] - ', req.method + " - " + req.url);
    setTimeout(function () {
      l.debug('[HTTPLOGGER] > delaying response ...');
      next();
    }, 20)
  }
  else {
    l.debug('[HTTPLOGGER] - ', req.method + " - " + req.url);
    next()
  };

  //    next();
}
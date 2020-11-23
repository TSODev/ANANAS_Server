import { Request, Response, NextFunction } from 'express';
import l from './logger';

export function checkCsrfToken(req: Request, res: Response, next: NextFunction) {
    const csrfCookie = req.cookies['XSRF-TOKEN'];
    const csrfHeader = req.headers['x-xsrf-token'];
    l.debug('Cookie  :', csrfCookie);
    l.debug('Header :', csrfHeader);
    l.debug('Check cookies : ', csrfCookie === csrfHeader);
    if (csrfCookie && csrfHeader && csrfCookie === csrfHeader) {
        next();
    } else {
        l.debug('Bad XSRF Tocken', csrfCookie, csrfHeader);
        res.sendStatus(403);
    }
}
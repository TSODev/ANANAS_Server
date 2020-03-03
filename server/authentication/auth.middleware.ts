
import {Request, Response, NextFunction } from 'express';
import l from '../common/logger';

export function checkIfAuthenticated(req: Request, res: Response, next: NextFunction) {
    const token = req['userId'];
    if (req['userId']) {
        l.debug('[CHECKIFAUTHENTICATED] - ', token);
        next();
    } else {
        l.debug('[CHECKIFAUTHENTICATED] - Not Authenticated !');
        res.sendStatus(403);
    }
}
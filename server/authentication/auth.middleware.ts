
import { Request, Response, NextFunction } from 'express';
import l from '../common/logger';

export function checkIfAuthenticated(req: Request, res: Response, next: NextFunction) {
    const token = req['userId'];
    if (req['userId']) {
        //        l.debug('[CHECKIFAUTHENTICATED] - ', token);
        next();
    } else {
        res.status(403).send('Utilsateur non authentifié');
    }
}
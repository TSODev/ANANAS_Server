//import UserService from '../../services/users.service';
import { Request, Response } from 'express';

//import { dbUser } from '../../../dbUser/database.mongo';
//import { dbFile } from '../../services/files.service';

import l from '../../../common/logger';

import db from '../../../common/dbPostGresConnect';

export class fileController {


    async allFiles(req: Request, res: Response) {
        if (!db.isDbConnected) res.sendStatus(500);
        const files = await dbFile.findAllFiles();
        res.status(200).json({ files: files });
    }


    createFile(req: Request, res: Response): void {
        if (!db.dbConnected) res.sendStatus(500);
        const data = req.body;
        l.debug('[FILECONTROLLER] - File : ', data);
        const errors = validateFileInfo(data);
        //    const errors = validatePassword(credentials.password);
        //    const errors = '';
        if (errors.length > 0) {
            res.status(400).json(errors);
        } else {
            createFileEntry(res, data)
                .catch(() => { res.sendStatus(500) });
        }
    }





    async getFileById(req: Request, res: Response) {
        if (!db.dbConnected) res.sendStatus(500);
        const id = req.params['id'];
        l.debug("[FILECONTROLLER] - looking for File Id: ", id);
        const file = await dbFile.findFileById(id);
        if (file) {
            res.status(200).json({ file: file });
        } else {
            res.sendStatus(204);
        }
    }


    async deleteFile(req: Request, res: Response) {
        if (!db.dbConnected) res.sendStatus(500);
        l.debug('[FILECONTROLLER] - Request for delete file id:', req.params.id);
        const user = await dbFile.deleteFile(req.params.id)
            .catch(err => res.sendStatus(500));
        res.sendStatus(201);
    }
}

//---------------------------------------------------------------------------------------

async function createFileEntry(res: Response, data) {
    try {
        const file = await dbFile.createFile(data);
        res.status(200).json({ file: file })
    } catch {
        res.status(500).json({ error: 'File already exist' })
    }
}



function validateFileInfo(data) {
    var errors = '';
    return errors;
}

export default new fileController();

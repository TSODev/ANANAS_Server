//import UserService from '../../services/users.service';
import { Request, Response } from 'express';

//import { dbUser } from '../../../dbUser/database.mongo';
import { dbMetadata } from '../../services/metadata.service'

import l from '../../../common/logger';
//import { DbUser } from '../../../dbUser/dbUser-user';
import { IMetadata } from '../../models/metadata.model';

const db = require('../../../common/dbPostGresConnect')

export class metadataController {

    async allMetadata(req: Request, res: Response) {
        dbMetadata.getAll()
            .then(metadata => {
                res.status(200).json({ metadata: metadata })
            })
            .catch(err => {
                res.status(400).send({ message: err.message })
            })
    }


    createMetadata(req: Request, res: Response): void {
        //        if (!db.dbConnected) res.sendStatus(500);
        const metadata = req.body;
        l.debug('[METADATACONTROLLER] - Metadata : ', metadata);

        dbMetadata.create(metadata)
            .then(md => {
                l.debug('[METADATACONTROLLER] - Metadata : ', md)
                res.status(200).json({ metadata: md })
            })
            .catch((err) => {
                l.error(err)
                res.status(400).send({
                    message: err.message
                })
            });

    }




    async getMetadataById(req: Request, res: Response) {
        l.debug("[METADATACONTROLLER] - Metadata by Id: ", req["id"]);
        dbMetadata.getById(req["id"])
            .then(md => {
                l.debug('[METADATACONTROLLER] - Get Metadata :', md)
                res.status(200).json({ metadata: md })
            })
            .catch(err => {
                res.status(400).send({ message: err.message })
            })
    }

}

export default new metadataController();
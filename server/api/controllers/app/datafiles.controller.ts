//import UserService from '../../services/users.service';
import { Request, Response } from 'express';

//import { dbUser } from '../../../dbUser/database.mongo';
import { dbDataFiles } from '../../services/datafile.service'

import l from '../../../common/logger';
//import { DbUser } from '../../../dbUser/dbUser-user';
import { IDataFile } from '../../models/datafiles.model';
import { dbHRA_Absence } from '../../services/HRA_absence.service';

const db = require('../../../common/dbPostGresConnect')

export class dataFilesController {

    async alldataFiles(req: Request, res: Response) {
        dbDataFiles.getAll()
            .then(datafiles => {
                res.status(200).json({ datafiles })
            })
            .catch(err => {
                res.status(400).send({ message: err.message })
            })
    }


    createdataFile(req: Request, res: Response): void {
        //        if (!db.dbConnected) res.sendStatus(500);
        const datafile = req.body;
        l.debug('[DATAFILECONTROLLER] - datafile : ', datafile);

        dbDataFiles.create(datafile)
            .then(df => {
                l.debug('[DATAFILECONTROLLER] - dataFile : ', df)
                res.status(200).json({ datafile: df })
            })
            .catch((err) => {
                l.error(err)
                res.status(400).send({
                    message: err.message
                })
            });

    }




    async getdataFileById(req: Request, res: Response) {
        l.debug("[DATAFILECONTROLLER] - datafile by Id: ", req["id"]);
        dbDataFiles.getById(req["id"])
            .then(df => {
                l.debug('[DATAFILECONTROLLER] - Get datafile :', df)
                res.status(200).json({ datafile: df })
            })
            .catch(err => {
                res.status(400).send({ message: err.message })
            })
    }

    async deletedataFileById(req: Request, res: Response) {
        l.debug("[DATAFILECONTROLLER] - delete datafile by Id: ", req.params.id);
        dbHRA_Absence.deleteAllAbsenceByFileId(parseInt(req.params.id))
            .then(nbRecords => {
                dbDataFiles.delete(parseInt(req.params.id))
                    .then(df => {
                        l.debug('[DATAFILECONTROLLER] - Delete datafile :', df)
                        res.status(200).json({ datafile: df })
                    })
                    .catch(err => {
                        res.status(400).send({ message: err.message })
                    })
            })
            .catch(err => res.status(400).send(err.message))

    }

}

export default new dataFilesController();
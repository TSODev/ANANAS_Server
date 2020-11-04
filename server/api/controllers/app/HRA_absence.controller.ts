//import UserService from '../../services/users.service';
import { Request, Response } from 'express';

//import { dbUser } from '../../../dbUser/database.mongo';
import { dbHRA_Absence } from '../../services/HRA_absence.service';
import { dbDataFiles } from '../../services/datafile.service';

import l from '../../../common/logger';
//import { DbUser } from '../../../dbUser/dbUser-user';

import db from '../../../common/dbPostGresConnect';

export class absenceController {


    async allAbsences(req: Request, res: Response) {
        if (!db.isDbConnected) res.sendStatus(500);
        const absences = await dbHRA_Absence.findAllAbsences();
        res.status(200).json({ absences: absences });
    }


    createAbsence(req: Request, res: Response): void {
        if (!db.dbConnected) res.sendStatus(500);
        const data = req.body;
        const errors = validateAbsenceInfo(data);
        //    const errors = validatePassword(credentials.password);
        //    const errors = '';
        if (errors.length > 0) {
            res.status(400).json(errors);
        } else {
            createAbs(res, data)
                .catch(() => { res.sendStatus(500) });
        }
    }

    async bulkCreateAbsence(req: Request, res: Response): Promise<void> {

        const bulk = req.body

        const name = bulk.name;
        const cols = bulk.cols;
        const rows = bulk.rows;

        dbDataFiles.getAll()
            .then(datafile => {
                //            l.debug(datafile)
                const file_exist = datafile.find(df => df.datafilename === bulk.name)
                if (file_exist !== undefined) {
                    try {
                        dbDataFiles.delete(file_exist.datafile_id)
                        dbHRA_Absence.deleteAllAbsenceByFileId(file_exist.datafile_id)
                    } catch (error) {
                        l.error(error.message)
                    }
                }

                dbDataFiles.create({
                    datafile_id: null,
                    datafilename: bulk.name,
                    datafileloaddate: new Date(),
                    nbrecords: 0,
                    createddate: new Date()
                }).then(df => {
                    dbHRA_Absence.createBulkAbsences(df, rows)
                        .then(absences => {
                            dbHRA_Absence.updateDatafileWithNbRecords(df, absences.length)
                                .then((result) => res.status(200).send({ nbRecords: absences.length, datafile: df }))
                                .catch(err => res.status(400).send({ message: err.message }))
                        })
                        .catch(err => {
                            res.status(400).send({ message: err.message })
                        })
                })
                    .catch(err => {
                        l.error(err)
                        res.status(400).send(err.message)
                    })

            })
            .catch(err => {
                l.error(err)
                res.status(400).send(err.message)
            }
            )


    }


    async getAbsence(req: Request, res: Response) {
        if (!db.dbConnected) res.sendStatus(500);
        const absence = await dbHRA_Absence.findAbsenceById(req["absenceId"]);

        if (absence) {
            res.status(200).json({ absence: absence });
        } else {
            res.sendStatus(204);
        }
    }

    async getAbsenceView(req: Request, res: Response) {
        dbHRA_Absence.listAbsencesView()
            .then(absences => res.status(200).json(absences))
            .catch(err => res.status(400).send(err.message))
    }

    async getAbsenceById(req: Request, res: Response) {
        //        if (!db.dbConnected) res.sendStatus(500);
        const id = req.params['id'];
        const absence = await dbHRA_Absence.findAbsenceById(id);
        if (absence) {
            res.status(200).json({ absence: absence });
        } else {
            res.sendStatus(204);
        }
    }


    async deleteAbsence(req: Request, res: Response) {
        //
        const user = await dbHRA_Absence.deleteAbsence(req.params.id)
            .catch(err => res.sendStatus(500));
        res.sendStatus(201);
    }

    async deleteAbsencesByLoad(req: Request, res: Response) {
        try {
            const nbRecords = dbHRA_Absence.deleteAllAbsenceByFileId(parseInt(req.params.id))
            res.status(200).send(nbRecords + ' deleted')
        } catch (error) {
            res.status(400).send(error.message)
        }
    }

    async getDistinctCode(req: Request, res: Response) {
        dbHRA_Absence.getDistinctCode()
            .then(codes => res.status(200).json({ codes }))
            .catch(err => res.status(400).send(err.message))
    }
}

//---------------------------------------------------------------------------------------

async function createAbs(res: Response, data) {
    try {
        const absence = await dbHRA_Absence.createAbsence(data);
        res.status(200).json({ absence: absence })
    } catch {
        res.status(500).json({ error: 'Absence already exist' })
    }
}





function validateAbsenceInfo(data) {
    var errors = '';
    return errors;
}

function validateBulkAbsenceInfo(bulkdata) {
    var errors = '';
    return errors;
}

export default new absenceController();

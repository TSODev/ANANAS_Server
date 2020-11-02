//import UserService from '../../services/users.service';
import { Request, Response } from 'express';


//import { dbUser } from '../../../dbUser/database.mongo';
import { dbLN_Absence } from '../../services/LN_absence.service';
import { ILN_Absence } from '../../models/LN_absences.model';

import l from '../../../common/logger';
//import { DbUser } from '../../../dbUser/dbUser-user';

import db from '../../../common/dbPostGresConnect';
import { dbPeople } from '../../services/people.service';
import { dbMetadata } from '../../services/metadata.service';

import * as _ from 'underscore'

var moment = require('moment'); // require
var fr = moment().locale('fr');
//var _ = require('lodash');

export class absenceController {

    async allAbsences(req: Request, res: Response) {
        l.debug('[LNABSENCESCONTROLLER] - All Absences');
        dbLN_Absence.findAllAbsences()
            .then(absences => res.status(200).json({ LN_absences: absences }))
            .catch(err => res.status(400).send({ message: err.message }))
    }

    async getAbsenceView(req: Request, res: Response) {

        l.debug("[LNABSENCECONTROLLER] - Absences View: ");
        dbLN_Absence.listAbsencesView()
            .then(absences => res.status(200).json(absences))
            .catch(err => res.status(400).send(err.message))
    }


    createAbsence(req: Request, res: Response): void {
        // if (!db.dbConnected) res.sendStatus(500);
        const data = req.body;
        l.debug('[LNABSENCESCONTROLLER] - Absences : ', data);
        const errors = validateAbsenceInfo(data);
        if (errors.length > 0) {
            res.status(400).send({ message: errors });
        } else {
            dbLN_Absence.createAbsence(data)
                .then(LNAbsence => res.status(200).json(LNAbsence))
                .catch(err => res.status(400).send({ message: err.message }))

        }
    }

    getAbsencesForPeopleId(req: Request, res: Response) {
        const peopleId = req.query['id'].toString()
        l.debug('[LNABSENCESCONTROLLER] - Get Absences for PeopleId : ', peopleId);
        dbLN_Absence.findAbsencesIdForPeopleId(parseInt(peopleId))
            .then(LNabsences => res.status(200).json({ LNabsences }))
            .catch(err => res.status(400).send({ message: err.message }))

    }

    getAbsenceById(req: Request, res: Response) {
        const id = req.params['id'];
        l.debug('[LNABSENCESCONTROLLER] - Get Absence Id : ', id);
        dbLN_Absence.findAbsenceById(id)
            .then(absence => res.status(200).json({ absence }))
            .catch(err => res.status(400).send({ message: err.message }))
    }

    async bulkCreateAbsence(req: Request, res: Response) {
        const bulk = req.body;
        l.debug('[LNABSENCESCONTROLLER] - Bulk Create Absences');
        //        dbLN_Absence.createBulkAbsences()    }

        // Clear the people and the LN_absence table !!!

        try {
            await dbPeople.clearCollection()
        } catch (error) {
            l.error(error.message)
        }

        try {
            await dbLN_Absence.clearCollection()
        } catch (error) {
            l.error(error.message)
        }


        let nbPeopleLoaded = 0;
        const nbPeopleToLoad = bulk.rows.length
        let nbAbsLoaded = 0

        const bulkAbsences = []
        for (let absence of bulk.rows) {
            const errors = validateBulkAbsenceInfo(absence);

            if (errors.length > 0) {
                res.status(400).json(errors);
                l.error('[LNABSENCESCONTROLLER] - Bulk Create Absences -: Aborted');
                break;
            } else {

                const the_people = {
                    people_id: null,
                    matricule: absence["Matricule collaborateur"],
                    tgi: absence["Tgi"],
                    fullname: absence["Nom prenom collaborateur"],
                    firstname: "",
                    lastname: "",
                    posact: absence["POSACT (origine REF)"],
                    entree: absence["Date entrée (Origine REF)"],
                    sortie: absence["Date sortie (Origine REF)"],
                    source: 1,
                    createdDate: null
                }

                dbPeople.createPeople(the_people)
                    .then(people => {

                        // ATTENTION
                        // Only takes the first 194 elements of each rows 
                        // in order to remove addional dates that we dont care about
                        //

                        const data = { people: people, absence: absence }

                        dbLN_Absence.createBulkAbsences(data)
                            .then((nbrec: number) => {
                                nbAbsLoaded += nbrec
                                nbPeopleLoaded += 1
                                //    l.debug('Pass : ', nbPeopleLoaded, ' -> ', nbrec.toString(), 'inserted')
                                if (nbPeopleLoaded >= nbPeopleToLoad) {
                                    try {
                                        dbMetadata.update({
                                            metadata_key: 'fileName',
                                            metadata_value: bulk.name,
                                            metadata_group: 'LN',
                                            createddate: new Date()
                                        })
                                    } catch (error) {
                                        l.error(error.message)
                                    }

                                    try {
                                        dbMetadata.update({
                                            metadata_key: 'lastLoaded',
                                            metadata_value: fr.format("dddd Do MMMM YYYY à HH:mm:ss"),
                                            metadata_group: 'LN',
                                            createddate: new Date()
                                        })
                                    } catch (error) {
                                        l.error(error.message)
                                    }

                                    res.status(200).send({ nbRecord: nbAbsLoaded })
                                }
                            })
                            .catch(err => {
                                throw (new Error('CreateBulkAbsences ' + err.message))
                                res.status(400).send(err.message)
                            })

                    })
                    .catch(err => {
                        l.error(err)
                        throw (new Error('CreatePeople ' + err.message))
                        res.status(400).send(err.message)
                    })
                //            }
            }
        }

    }

    async getDistinctCode(req: Request, res: Response) {
        dbLN_Absence.getDistinctCode()
            .then(codes => res.status(200).json({ codes }))
            .catch(err => res.status(400).send(err.message))
    }

    /*    
            async getAbsence(req: Request, res: Response) {
                if (!db.dbConnected) res.sendStatus(500);
                l.debug("[LNABSENCECONTROLLER] - looking for current absence (id): ", req["absenceId"]);
                const absence = await dbLN_Absence.findAbsenceById(req["absenceId"]);
        
                if (absence) {
                    res.status(200).json({ absence: absence });
                } else {
                    res.sendStatus(204);
                }
            }
        
            async getAbsencesForPeople(req: Request, res: Response) {
                if (!db.dbConnected) res.sendStatus(500);
                const id = req.query['people_id'];
                l.debug("[LNABSENCECONTROLLER] - looking absences for current people (id): ", id);
                await LN_Absence.find({ people_id: id }, (err, docs) => {
                    if (!err)
                        res.status(200).json({ absences: docs })
                    else
                        res.status(204)
                })
            }
        
            async getAbsencesForTGI(req: Request, res: Response) {
                if (!db.dbConnected) res.sendStatus(500);
                const id = req.query['tgi'];
                l.debug("[LNABSENCECONTROLLER] - looking absences for current people (id): ", id);
                await LN_Absence.find({ tgi: id }, (err, docs) => {
                    if (!err)
                        res.status(200).json({ absences: docs })
                    else
                        res.status(204)
                })
            }
        
            async getAbsenceById(req: Request, res: Response) {
                if (!db.dbConnected) res.sendStatus(500);
                const id = req.params['id'];
                l.debug("[LNABSENCECONTROLLER] - looking for absenceId: ", id);
                const absence = await dbLN_Absence.findAbsenceById(id);
                if (absence) {
                    res.status(200).json({ absence: absence });
                } else {
                    res.sendStatus(204);
                }
            }
        
        
            async deleteAbsence(req: Request, res: Response) {
                if (!db.dbConnected) res.sendStatus(500);
                l.debug('[LNABSENCECONTROLLER] - Request for delete absenceId:', req.params.id);
                const user = await dbLN_Absence.deleteAbsence(req.params.id)
                    .catch(err => res.sendStatus(500));
                res.sendStatus(201);
            }
        }
        
        //---------------------------------------------------------------------------------------
        
        async function createAbs(res: Response, data) {
            try {
                const absence = await dbLN_Absence.createAbsence(data);
                res.status(200).json({ absence: absence })
            } catch {
                res.status(500).json({ error: 'Absence already exist' })
            }
        
             */
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

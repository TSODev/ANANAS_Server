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
        dbLN_Absence.findAllAbsences()
            .then(absences => res.status(200).json({ LN_absences: absences }))
            .catch(err => res.status(400).send({ message: err.message }))
    }

    async getAbsenceView(req: Request, res: Response) {
        dbLN_Absence.listAbsencesView()
            .then(absences => res.status(200).json(absences))
            .catch(err => res.status(400).send(err.message))
    }


    createAbsence(req: Request, res: Response): void {
        // if (!db.dbConnected) res.sendStatus(500);
        const data = req.body;
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
        dbLN_Absence.findAbsencesIdForPeopleId(parseInt(peopleId))
            .then(LNabsences => res.status(200).json({ LNabsences }))
            .catch(err => res.status(400).send({ message: err.message }))

    }

    getAbsenceById(req: Request, res: Response) {
        const id = req.params['id'];
        dbLN_Absence.findAbsenceById(id)
            .then(absence => res.status(200).json({ absence }))
            .catch(err => res.status(400).send({ message: err.message }))
    }

    async bulkCreateAbsence(req: Request, res: Response) {
        const bulk = req.body;

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

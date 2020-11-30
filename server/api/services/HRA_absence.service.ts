import * as promise from 'bluebird'; // best promise library today

import l from '../../common/logger';
import { IHRA_Absence, IHRA_Absence_View } from '../models/HRA_absences.model';
import { IDataFile } from '../models/datafiles.model';
import { IPeople } from '../models/people.model';
import * as _ from 'lodash';

import { dbPeople } from './people.service';

import { HRAanalyse } from '../../common/UNUSED_analyse'

import db from '../../common/dbPostGresConnect'
import { pgp, tbl_LN } from '../../common/dbPostGresConnect'
import { ILN_Absence } from '../models/LN_absences.model';

const { ParameterizedQuery: PQ } = require('pg-promise');
var moment = require('moment')


class HRAAbsenceService {

    // "Matricule gestion",
    // "Code absence",
    // "Code langue",
    // "Date début absence",
    // "Date fin absence",
    // "Horodatage chrgmt",
    // "Identifiant",
    // "Ident situation",
    // "Id élém rémun",
    // "Libellé absence",
    // "Matricule gestion_1",
    // "Modèle rép absence",
    // "Numéro de bulletin",
    // "Numéro traitement",
    // "Partition Réglem.",
    // "Position sur le bu",
    // "Période de paie",
    // "Réglementation",
    // "Répertoire absence",
    // "Source absence",
    // "Usage de paie",
    // "Centre de coût",
    // "Matricule GP",
    // "Nom usuel GP",
    // "Prénom GP"


    async createAbsence(data): Promise<string> {
        return new promise.Promise((resolve, reject) => {
            reject('service not implemented')
        })

    }

    async updateDatafileWithNbRecords(df: IDataFile, nb: number): Promise<IDataFile> {
        return new promise.Promise((resolve, reject) => {
            // const cs = pgp.helpers.ColumnSet([
            //     'datafile_id',
            //     'datafilename',
            //     'datafileloaddate',
            //     'nbRecords',
            //     'createddate',
            // ], { table: 'datafiles' })
            // const dataToUpdate = { nbRecords: nb }
            // const condition = pgp.as.format(' WHERE datafile_id = ${datafile_id}',)
            // const Query = pgp.helpers.update(dataToUpdate, null, 'datafiles') + condition

            const Query = new PQ({
                text: 'UPDATE datafiles SET nbrecords = $1 WHERE datafile_id = $2',
                values: [nb, df.datafile_id]
            })

            l.debug(Query)

            db.none(Query)
                .then(df => resolve(df))
                .catch(err => reject(err))
        })
    }

    async findOrCreatePeople(tgi: string): Promise<IPeople> {
        return new promise.Promise((resolve, reject) => {
            dbPeople.findPeopleByTGI(tgi)
                .then(people => resolve(people))
                .catch(() => {
                    dbPeople.createPeopleFromHRA({
                        people_id: null,
                        source: 2,
                        matricule: 0,
                        tgi: tgi,
                        fullname: "",
                        firstname: "",
                        lastname: "",
                        entree: null,
                        sortie: null,
                        posact: "",
                        createdDate: new Date()
                    })
                        .then(people => resolve(people))
                        .catch(err => reject(err))
                })
        })
    }

    async buildBulkAbsencesArray(data: [IHRA_Absence], loadId: number): Promise<any[]> {
        return new promise.Promise((resolve, reject) => {
            let HRABulkAbsencesArray = []
            let HRABulkStart = moment()
            let HRABulkStop = moment()

            let index = 0

            data.forEach(async element => {
                let people = null

                const momentDebut = moment(element["Date début absence"])
                const momentFin = moment(element["Date fin absence"])
                if (momentDebut.isBefore(HRABulkStart)) HRABulkStart = momentDebut
                if (momentFin.isAfter(HRABulkStop)) HRABulkStop = momentFin

                try {
                    people = await this.findOrCreatePeople(element['Matricule gestion'])
                } catch (error) {
                    l.error(error)
                    reject(error)
                }
                index += 1
                //                l.debug(index.toString(), data.length)

                HRABulkAbsencesArray.push(
                    {
                        //                            absence_id: null,
                        people_id: people.people_id,
                        load_id: loadId,
                        code: element["Code absence"],
                        libelle: element["Libellé absence"],
                        // debut: momentDebut.toDate(),
                        // fin: momentFin.toDate(),
                        debut: new Date(momentDebut.local(true).format()),
                        fin: new Date(momentFin.local(true).format()),
                        identifiant: element["Identifiant"],
                        modele_rep_absence: element["Modèle rép absence"],
                        num_bulletin: element["Numéro de bulletin"],
                        num_traitement: element["Numéro traitement"],
                        partition_reglem: element["Partition Réglem."],
                        position_bu: element["Position sur le bu"],
                        periode_paie: element["Période de paie"],
                        reglementation: element["Réglementation"],
                        repertoire_absence: element["Répertoire absence"],
                        source_absence: element["Source absence"],
                        usage_paie: element["Usage de paie"],
                        centre_cout: element["Centre de coût"],
                        matricule_gp: element["Matricule GP"],
                        hasanomalie: false,
                        createddate: new Date()
                    })
                if (index >= data.length) {
                    resolve(HRABulkAbsencesArray)
                }
            })
        })
    }

    async createBulkAbsences(df: IDataFile, data: [IHRA_Absence]): Promise<[IHRA_Absence]> {

        return new promise.Promise(async (resolve, reject) => {

            this.buildBulkAbsencesArray(data, df.datafile_id)
                .then(absArray => {
                    const cs = new pgp.helpers.ColumnSet([
                        //                'absence_id',
                        'people_id',
                        'load_id',
                        'code',
                        'libelle',
                        'debut',
                        'fin',
                        'identifiant',
                        'modele_rep_absence',
                        'num_bulletin',
                        'num_traitement',
                        'partition_reglem',
                        'position_bu',
                        'periode_paie',
                        'reglementation',
                        'repertoire_absence',
                        'source_absence',
                        'usage_paie',
                        'centre_cout',
                        'matricule_gp',
                        'hasanomalie',
                        'createddate'
                    ], { table: 'hra_absences' })

                    const Query = pgp.helpers.insert(absArray, cs) + ' RETURNING *'

                    //            l.debug(Query)

                    db.many(Query)
                        .then((absences) => {
                            resolve(absences)
                        })
                        .catch(err => {
                            l.error('Service Bulk Create Absence : ', err.message)
                            reject(err)
                        })

                })
                .catch(err => reject(err))


        })
    }

    async deleteAllAbsenceByFileId(fileId: number): Promise<number> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'DELETE FROM hra_absences WHERE load_id = $1',
                values: fileId
            })
            db.none(Query)
                .then((nbRecords) => resolve(nbRecords))
                .catch(err => reject(err))
        })
    }

    async findAbsenceById(absId: string): Promise<IHRA_Absence> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT * FROM hra_absences WHERE absence_id = $1',
                values: absId
            })
            db.one(Query)
                .then(data => resolve(data))
                .catch(err => reject(err))
        })
    }


    async findAllAbsences(): Promise<IHRA_Absence[]> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT * FROM hra_absences',
            })
            db.many(Query)
                .then(absences => resolve(absences))
                .catch(err => reject(err))
        })
        //        return await LN_Absence.find();
    }

    async listAbsencesView(): Promise<IHRA_Absence_View[]> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT * FROM HRAView'
            })
            db.manyOrNone(Query)
                .then((absences) => resolve(absences))
                .catch(err => reject(err))
        })
    }

    async findAbsencesIdForPeopleId(peopleId: Number): Promise<[string]> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT absence_id FROM hra_absences WHERE people_id = $1',
                values: peopleId
            })
            db.many(Query)
                .then(data => resolve(data))
                .catch(err => reject(err))
        })
    }

    async findAbsencesForPeopleId(peopleId: Number): Promise<[IHRA_Absence]> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT * FROM hra_absences WHERE people_id = $1',
                values: peopleId
            })
            db.manyOrNone(Query)
                .then(data => resolve(data))
                .catch(err => reject(err))
        })
    }

    async deleteAbsence(id: string): Promise<IHRA_Absence> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'DELETE FROM hra_absences WHERE absence_id = $1',
                values: id
            })
            db.one(Query)
                .then(data => resolve(data))
                .catch(err => reject(err))
        })

    }

    async getDistinctCode(): Promise<[string]> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT DISTINCT code FROM ananas.hra_absences;'
            })
            db.many(Query)
                .then(codes => resolve(codes))
                .catch(err => reject(err))
        })
    }


}

export const dbHRA_Absence = new HRAAbsenceService();



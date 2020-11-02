import * as promise from 'bluebird'; // best promise library today

import l from '../../common/logger';
import { ILN_Absence, ILN_Absence_View } from '../models/LN_absences.model';
import * as _ from 'lodash';

import { dbPeople } from './people.service';

import db from '../../common/dbPostGresConnect'
import { pgp, tbl_LN } from '../../common/dbPostGresConnect'
import { IPeople } from '../models/people.model';

const { ParameterizedQuery: PQ } = require('pg-promise');
var moment = require('moment')


class LNAbsenseService {

    // export interface ILN_Absence {
    //     absence_id: string,
    //     people_id: string,
    //     matricule: string,
    //     tgi: string,
    //     code: string,
    //     regroupement: string,
    //     debut: Date,
    //     fin: Date,
    //     abs_month: number,
    //     abs_year: number,
    //     createdDate: Date
    // }



    async clearCollection() {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'DELETE FROM ln_absences',
            })
            db.none(Query)
                .then(data => {
                    const Query = new PQ({
                        text: 'ALTER SEQUENCE ln_absences_absence_id_seq RESTART WITH 1;',
                    })
                    db.none(Query)
                        .then(data => resolve(data))
                        .catch(err => reject(err))
                })

                .catch(err => reject(err))
        })
    }


    async createAbsencesForPeople(data) {

        // //        l.debug('createAbsencesForPeople', data)
        // const matricule = data["Matricule collaborateur"];
        // //        l.debug('CREATE ABSENCES FOR PEOPLE : matricule', matricule)
        // //const people = await dbPeople.findPeopleByMatricule(matricule)
        // let the_people, docs
        // const people_id = this.uuidv4()
        // //if (people === null) {

        // try {
        //     docs = await this.createBulkAbsences(people_id, data)
        //     try {
        //         the_people = await People.create({
        //             people_id: people_id,
        //             matricule: data["Matricule collaborateur"],
        //             tgi: data["TGI collaborateur"],
        //             fullname: data["Nom prenom collaborateur"],
        //             ln_absences: docs,
        //             firstname: '',
        //             lastname: '',
        //             posact: data["POSACT (origine REF)"],
        //             createdDate: new Date()
        //         })
        //     } catch (error) {
        //         l.error(error)
        //     }
        // } catch (error) {
        //     l.error(error)
        // }

        // return docs
    }

    AbsenceStopAtKey(key: string, stopKey: string) {
        return (key === stopKey)
    }

    async createBulkAbsences(data: { people: IPeople, absence }) {

        return new promise.Promise((resolve, reject) => {
            const people_id = data.people.people_id
            const people_matricule = data.people.matricule
            const people_tgi = data.people.tgi
            const keys = Object.keys(data.absence)

            //            l.debug('Keys: ', keys)
            const stopIndex = _.findIndex(keys, (k) => this.AbsenceStopAtKey(k, 'DOUBLON'))

            const LNBulkAbsences = []
            let docs = []
            for (const key of _.slice(keys, 0, stopIndex)) {
                const regex = RegExp('^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])$')
                const isDate = (key.match(regex) !== null)

                if (isDate) {

                    // const id = this.uuidv4();
                    const absMoment = moment(key, 'D/MM')

                    LNBulkAbsences.push({
                        absence_id: null,
                        people_id: people_id,
                        matricule: people_matricule,
                        tgi: people_tgi,
                        code: data.absence[key],
                        regroupement: '',
                        debut: absMoment.toDate(),
                        fin: absMoment.toDate(),
                        hasanomalie: false,
                        createddate: new Date()
                    })

                    if (people_id === 120) l.debug('BULKINSERT [120]:', absMoment.format('DD MMM YY'))
                }
            }


            // Now we have a n Array of absences

            //            const cs = new pgp.helpers.ColumnSet(['people_id', 'matricule', 'tgi', 'code', 'regroupement', 'debut', 'fin', 'abs_month', 'abs_year', 'createddate'], { table: 'ln_absences' });
            const cs = new pgp.helpers.ColumnSet(['people_id', 'matricule', 'tgi', 'code', 'regroupement', 'debut', 'fin', 'hasanomalie', 'createddate'], { table: 'ln_absences' });

            const Query = pgp.helpers.insert(LNBulkAbsences, cs) + ' RETURNING absence_id'


            db.many(Query)
                .then((ids) => {
                    //                    l.debug('createBulkAbsence result : ', ids, ids.length)
                    resolve(ids.length)
                })
                .catch(err => {
                    l.error('Service Bulk Create Absence : ', err.message)
                    reject(err)
                })

        })
    }

    async createAbsence(data: ILN_Absence): Promise<ILN_Absence> {

        return new promise.Promise((resolve, reject) => {
            const cs = new pgp.helpers.ColumnSet(['people_id', 'matricule', 'tgi', 'code', 'regroupement', 'debut', 'fin', 'abs_month', 'abs_year', 'createddate'], { table: 'ln_absences' });
            const Query = pgp.helpers.insert({ ...data, createddate: new Date() }, cs) + ' RETURNING *'
            // const Query = new PQ({
            //     text: 'INSERT INTO ln_absences (people_id, matricule, tgi, code, regroupement, debut, fin, abs_month, abs_year, createdDate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            //     values: [
            //         data.people_id,
            //         data.matricule,
            //         data.tgi,
            //         data.code,
            //         data.regroupement,
            //         data.debut,
            //         data.fin,
            //         data.abs_month,
            //         data.abs_year,
            //         new Date()
            //     ]
            // })
            db.one(Query)
                .then((LNAbsence: ILN_Absence) => {
                    resolve(LNAbsence)
                })
                .catch(err => reject(err))
        })

        // const id = this.uuidv4();

        // let absence = new LN_Absence({
        //     absence_id: id,
        //     people_id: data.id,
        //     matricule: data.matricule,
        //     code: data.code,
        //     group: data.group,
        //     debut: data.debut,
        //     fin: data.fin,
        //     abs_month: data.month,
        //     abs_year: data.year,
        //     createdDate: new Date()
        // });
        // const link = absence.save();
        // //        dbPeople.addLN_Absence(data.matricule, (await link)._id)
        // return absence;
    }


    async findAbsenceById(absId: string): Promise<ILN_Absence> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT * FROM ln_absences WHERE absence_id = $1',
                values: absId
            })
            db.one(Query)
                .then(data => resolve(data))
                .catch(err => reject(err))
        })
    }


    async findAllAbsences(): Promise<ILN_Absence[]> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT * FROM ln_absences',
            })
            db.many(Query)
                .then(absences => resolve(absences))
                .catch(err => reject(err))
        })
        //        return await LN_Absence.find();
    }

    async listAbsencesView(): Promise<ILN_Absence_View[]> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT * FROM lnview'
            })
            db.manyOrNone(Query)
                .then((absences) => resolve(absences))
                .catch(err => reject(err))
        })
    }


    async findAbsencesIdForPeopleId(peopleId: Number): Promise<[string]> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT absence_id FROM ln_absences WHERE people_id = $1',
                values: peopleId
            })
            db.many(Query)
                .then(data => resolve(data))
                .catch(err => reject(err))
        })
    }

    async findAbsencesForPeopleId(peopleId: Number): Promise<[ILN_Absence]> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT * FROM ln_absences WHERE people_id = $1',
                values: peopleId
            })
            db.manyOrNone(Query)
                .then(data => resolve(data))
                .catch(err => reject(err))
        })
    }

    async deleteAbsence(id: string): Promise<ILN_Absence> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'DELETE FROM ln_absences WHERE absence_id = $1',
                values: id
            })
            db.one(Query)
                .then(data => resolve(data))
                .catch(err => reject(err))
        })
        // l.debug('Deleting absebceId : ', id);
        // return await LN_Absence.findOneAndDelete({ absence_id: id });
    }


    async getDistinctCode(): Promise<[string]> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT DISTINCT code FROM ananas.ln_absences;'
            })
            db.many(Query)
                .then(codes => resolve(codes))
                .catch(err => reject(err))
        })
    }


}


export const dbLN_Absence = new LNAbsenseService();



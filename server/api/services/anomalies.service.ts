import * as promise from 'bluebird'; // best promise library today

import l from '../../common/logger';
import { IAnomalie, IAnomalie_View, } from '../models/anomalies.model';
import * as _ from 'lodash';

import { dbPeople } from './people.service';

import db from '../../common/dbPostGresConnect'
import { pgp, tbl_LN } from '../../common/dbPostGresConnect'
import { dbHRA_Absence } from './HRA_absence.service';
import { dbLN_Absence } from './LN_absence.service';
import { IHRA_Absence } from '../models/HRA_absences.model';
import { ILN_Absence } from '../models/LN_absences.model';
import P from 'pino';

const { ParameterizedQuery: PQ } = require('pg-promise');
var moment = require('moment')

const HRAmapping = [
    // { in: ':CP', mapped: 'CPJ', color: '-', rule: [] },

    { in: '.CHO', mapped: 'APN' },
    { in: '!CHO', mapped: 'APN' },
    { in: '.RTTE', mapped: 'RTT' },
    { in: 'RTTE', mapped: 'RTT' },
    { in: '.RTTE', mapped: 'RTA' },
    { in: 'RTTE', mapped: 'RTA' },
    { in: 'CHO', mapped: 'APN' },
    { in: '.CP', mapped: 'CAN' },
    { in: '.CPANC', mapped: 'CAN' },
    { in: '.CP', mapped: 'CL3' },
    { in: 'CP', mapped: 'CL3' },
    { in: '.CP', mapped: 'CPF' },
    { in: 'EVF', mapped: 'EVF' },
    { in: '.AAP', mapped: 'HBA' },
    { in: '.CM', mapped: 'MAL' },
    { in: 'CM', mapped: 'MAL' },
    { in: '.CM', mapped: 'PAT' },
    { in: '.RTTs', mapped: 'RTA' },

]

const AllHRAmaps = (code) => {
    return HRAmapping.filter(m => m.mapped === code)
}

const AllLNmaps = (code) => {
    return HRAmapping.filter(m => m.in === code)
}


const JoursFeries = (an) => {
    var JourAn = new Date(an, 0, 1)
    var FeteTravail = new Date(an, 4, 1)
    var Victoire1945 = new Date(an, 4, 8)
    var FeteNationale = new Date(an, 6, 14)
    var Assomption = new Date(an, 7, 15)
    var Toussaint = new Date(an, 10, 1)
    var Armistice = new Date(an, 10, 11)
    var Noel = new Date(an, 11, 25)
    var SaintEtienne = new Date(an, 11, 26)

    var G = an % 19
    var C = Math.floor(an / 100)
    var H = (C - Math.floor(C / 4) - Math.floor((8 * C + 13) / 25) + 19 * G + 15) % 30
    var I = H - Math.floor(H / 28) * (1 - Math.floor(H / 28) * Math.floor(29 / (H + 1)) * Math.floor((21 - G) / 11))
    var J = (an * 1 + Math.floor(an / 4) + I + 2 - C + Math.floor(C / 4)) % 7
    var L = I - J
    var MoisPaques = 3 + Math.floor((L + 40) / 44)
    var JourPaques = L + 28 - 31 * Math.floor(MoisPaques / 4)
    var Paques = new Date(an, MoisPaques - 1, JourPaques)
    var VendrediSaint = new Date(an, MoisPaques - 1, JourPaques - 2)
    var LundiPaques = new Date(an, MoisPaques - 1, JourPaques + 1)
    var Ascension = new Date(an, MoisPaques - 1, JourPaques + 39)
    var Pentecote = new Date(an, MoisPaques - 1, JourPaques + 49)
    var LundiPentecote = new Date(an, MoisPaques - 1, JourPaques + 50)

    return [JourAn, VendrediSaint, Paques, LundiPaques, FeteTravail, Victoire1945, Ascension, Pentecote, LundiPentecote, FeteNationale, Assomption, Toussaint, Armistice, Noel, SaintEtienne]
}


class AnomaliesService {




    async clearCollection() {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'DELETE FROM Anomalies',
            })
            db.none(Query)
                .then(data => {
                    const Query = new PQ({
                        text: 'ALTER SEQUENCE anomalies_anomalie_id_seq RESTART WITH 1;',
                    })
                    db.none(Query)
                        .then(data => resolve(data))
                        .catch(err => reject(err))
                })

                .catch(err => reject(err))
        })
    }


    async createAnomalie(data: IAnomalie): Promise<IAnomalie> {

        return new promise.Promise((resolve, reject) => {
            const cs = new pgp.helpers.ColumnSet(['people_id', 'etat', 'hracode', 'lncode', 'libelle', 'debut', 'commentaire', 'createddate'], { table: 'anomalies' });
            const Query = pgp.helpers.insert({ ...data, createddate: new Date() }, cs) + ' RETURNING *'

            db.one(Query)
                .then((Anomalie: IAnomalie) => {
                    resolve(Anomalie)
                })
                .catch(err => reject(err))
        })
    }

    async updateAnomalieWithEtatAndComment(data: IAnomalie): Promise<IAnomalie> {
        return new promise.Promise((resolve, reject) => {
            const cs = new pgp.helpers.ColumnSet(['etat', 'commentaire'], { table: 'anomalies' });
            const condition = pgp.as.format(' WHERE anomalie_id = ' + data.anomalie_id);
            //   l.debug('UPDATE METADATA :', condition)
            const Query = pgp.helpers.update(data, cs) + condition + ' RETURNING anomalie_id'

            l.debug('UPDATE ANOMALIE :', Query, data)

            db.one(Query)
                .then(data => resolve(data))
                .catch(err => reject(err))
        })
    }

    async anomaliesBulkInsert(bulkArray: IAnomalie[]): Promise<IAnomalie[]> {
        return new promise.Promise((resolve, reject) => {
            const cs = new pgp.helpers.ColumnSet(['people_id', 'anomalie_from', 'etat', 'hra_id', 'hracode', 'ln_id', 'lncode', 'libelle', 'debut', 'commentaire', 'createddate'], { table: 'anomalies' });

            const Query = pgp.helpers.insert(bulkArray, cs) + ' RETURNING *'


            db.many(Query)
                .then((anomalies) => {
                    //                    l.debug('createBulkAbsence result : ', ids, ids.length)
                    resolve(anomalies)
                })
                .catch(err => {
                    l.error('Service Bulk Create Anomalies : ', err.message)
                    reject(err)
                })
        })
    }

    analyse(HRA_abs: IHRA_Absence[], LN_abs: ILN_Absence[]): IAnomalie[] {

        const anomaliesArray: IAnomalie[] = []
        HRA_abs.forEach(hra => {
            const hra_debut = moment(hra.debut)
            const hra_fin = moment(hra.fin)
            for (var date = hra_debut; date.isBefore(hra_fin); date.add(1, 'days')) {
                const day = moment(date).day()
                const ln = LN_abs.filter(ln => moment(ln.debut).isSame(moment(date), 'day'))
                if (ln.length > 0) {
                    const lncode = ln[0].code
                    const lnid = ln[0].absence_id
                    //                    l.debug('FROM HRA hra_id', hra.absence_id, "ln_id", lnid)
                    //            if (day !== 0 && day !== 6 && JF.some(ferie => date === ferie)) {                           // Does not check on Week End
                    if (day !== 0 && day !== 6) {                           // Does not check on Week End
                        const HRAmap = AllHRAmaps(hra.code)
                        const result = HRAmap.some(c => c.in === lncode)
                        //                        l.debug('ANALYSE HRA>LN : ', result, lncode, HRAmap)
                        if (!HRAmap.some(c => c.in === ln[0].code)) {               // Il y a anomalie
                            anomaliesArray.push({
                                anomalie_id: null,
                                anomalie_from: 'HRA',
                                people_id: hra.people_id,
                                etat: 1,
                                hra_id: hra.absence_id,
                                hracode: hra.code,
                                ln_id: lnid,
                                lncode: lncode,
                                libelle: 'HRA: ' + hra.code + ' ne correspond pas avec LN: ' + lncode,
                                debut: moment(date).toDate(),
                                commentaire: '',
                                createddate: new Date()
                            })
                        }
                    }
                }

            }
        })
        LN_abs.forEach(ln => {

            const date = moment(ln.debut)
            const day = moment(date).day()
            const hra = HRA_abs.filter(hra => (moment(hra.debut).isSameOrBefore(moment(date), 'day') && moment(hra.fin).isSameOrAfter(moment(date), 'day')))
            if (hra.length > 0) {
                const hracode = hra[0].code
                const hraid = hra[0].absence_id
                //                l.debug('FROM LN hra_id', hraid, "ln_id", ln.absence_id)
                //            if (day !== 0 && day !== 6 && JF.some(ferie => date === ferie)) {                           // Does not check on Week End
                if (day !== 0 && day !== 6) {                           // Does not check on Week End
                    const LNmap = AllLNmaps(ln.code)
                    const result = LNmap.some(c => c.mapped === hracode)
                    //                        l.debug('ANALYSE HRA>LN : ', result, lncode, HRAmap)
                    if (!result) {               // Il y a anomalie
                        anomaliesArray.push({
                            anomalie_id: null,
                            anomalie_from: 'LN',
                            people_id: ln.people_id,
                            etat: 1,
                            hra_id: hraid,
                            hracode: hracode,
                            ln_id: ln.absence_id,
                            lncode: ln.code,
                            libelle: 'LN: ' + ln.code + ' ne correspond pas avec HRA: ' + hracode,
                            debut: moment(date).toDate(),
                            commentaire: '',
                            createddate: new Date()
                        })
                    }
                }
                //                }

            }
        })
        return anomaliesArray
    }

    async analyseForPeopleId(peopleId: number): Promise<IAnomalie[]> {
        return new promise.Promise((resolve, reject) => {
            dbHRA_Absence.findAbsencesForPeopleId(peopleId)
                .then(HRA_abs => {
                    if (HRA_abs.length > 0) {
                        dbLN_Absence.findAbsencesForPeopleId(peopleId)
                            .then(LN_abs => {
                                if (LN_abs.length > 0) {
                                    const anomaliesArray = this.analyse(HRA_abs, LN_abs)
                                    if (anomaliesArray.length !== 0) {
                                        this.anomaliesBulkInsert(anomaliesArray)
                                            .then(anomalies => resolve(anomalies))
                                            .catch(err => {
                                                //                                                l.debug('Analyse :', err)
                                                reject(err)
                                            })
                                    }
                                    else
                                        resolve([])
                                }
                            })
                            .catch(err => {
                                //                                l.debug('Find LN Absence :', err)
                                reject(err)
                            })
                    } else {
                        resolve([])
                    }

                })
                .catch(err => {
                    //                    l.debug('Find HRA Absence :', err)
                    reject(err)
                })
        })
    }

    async bulkAnalyse() {
        return new promise.Promise((resolve, reject) => {
            var AllAnomalies = []
            dbPeople.findAllPeople()            //TODO : Filter by people coming from LN ?
                .then(people => {
                    var nbPeople = people.length
                    var currentPeople = 0
                    people.forEach(p => {
                        if (p.matricule !== 0) {
                            this.analyseForPeopleId(p.people_id)
                                .then(anomalies => {
                                    //                                    l.debug('Analyse People :', currentPeople, '/', nbPeople, " ", p.people_id, p.matricule)

                                    AllAnomalies = AllAnomalies.concat(anomalies)
                                    currentPeople += 1
                                    if (currentPeople === nbPeople)
                                        resolve(AllAnomalies)
                                })
                                .catch(err => reject(err))
                        } else currentPeople += 1

                    })

                })
                .catch(err => reject(err))
        })
    }

    async findAnomalieById(anoId: string): Promise<IAnomalie> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT * FROM anomalies WHERE anomalie_id = $1',
                values: anoId
            })
            db.one(Query)
                .then(data => resolve(data))
                .catch(err => reject(err))
        })
    }


    async findAllAnomalies(): Promise<IAnomalie[]> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT * FROM anomalies',
            })
            db.many(Query)
                .then(anomalies => resolve(anomalies))
                .catch(err => reject(err))
        })
    }

    async findAnomaliesIdForPeopleId(peopleId: Number): Promise<[string]> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT anomalie_id FROM anomalies WHERE people_id = $1',
                values: peopleId
            })
            db.many(Query)
                .then(data => resolve(data))
                .catch(err => reject(err))
        })
    }

    async deleteAnomalie(id: string): Promise<IAnomalie> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'DELETE FROM anomalies WHERE anomalie_id = $1',
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
                text: 'SELECT DISTINCT code FROM ananas.anomalies;'
            })
            db.many(Query)
                .then(codes => resolve(codes))
                .catch(err => reject(err))
        })
    }

    async getAllFromView(): Promise<IAnomalie_View[]> {
        return new promise.Promise((resolve, reject) => {
            const Query = new PQ({
                text: 'SELECT * FROM anoview'
            })
            db.manyOrNone(Query)
                .then(anomalies => resolve(anomalies))
                .catch(err => reject(err))
        })
    }


}


export const dbAnomalies = new AnomaliesService();



import * as promise from 'bluebird'; // best promise library today

import l from '../../common/logger';

import { IPeople } from '../models/people.model';
import * as _ from 'lodash';

import db from '../../common/dbPostGresConnect'
import { dbLN_Absence } from './LN_absence.service';
import { pgp } from '../../common/dbPostGresConnect'

const { ParameterizedQuery: PQ } = require('pg-promise');
var moment = require('moment')



class peopleService {


    async deleteCollection() {
        // try {
        //     // const people = new People;
        //     // people.collection.drop((err, OK) => {
        //     //     if (err) throw err;
        //     //     if (OK) l.debug('People collection dropped!')
        //     })
        // } catch (error) {
        //     l.error(error)
        // }
    }

    async clearCollection() {
        return new promise.Promise((resolve, reject) => {

            const Query = new PQ({
                text: 'DELETE FROM people',
            })
            db.none(Query)
                .then(data => {
                    const Query = new PQ({
                        text: 'ALTER SEQUENCE people_people_id_seq RESTART WITH 1',
                    })
                    db.none(Query)
                        .then(data => resolve(data))
                        .catch(err => reject(err))
                })

                .catch(err => reject(err))
        })
    }

    // matricule: string,
    // tgi: string,
    // fullname: string,
    // firstname: string,
    // lastname: string,
    // HRA_absences: [string]
    // LN_absences: [string]
    // posact: string,
    // entree: string,
    // sortie: string,
    // createdDate: Date

    async createPeople(people: IPeople): Promise<IPeople> {
        return new promise.Promise((resolve, reject) => {
            //            l.debug('Create People : ', people)

            // const cs = new pgp.helpers.ColumnSet(['people_id', 'matricule', 'tgi', 'fullname', 'firstname', 'lastname', 'posact', 'entree', 'sortie', 'hraabsences', 'lnabsences', 'createddate'], { table: 'ln_absences' });
            // const Query = pgp.helpers.insert({ people_id: null, ...people, createddate: new Date() }, cs) + ' RETURNING *'

            const createPeople = new PQ({
                text: 'INSERT INTO people (source, matricule, tgi, fullname, firstname, lastname, posact, entree, sortie, createdDate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING * ',
                values: [
                    1,
                    people["matricule"],
                    people["tgi"],
                    people.fullname,
                    people.firstname,
                    people.lastname,
                    people["posact"],
                    people["entree"],
                    people["sortie"],
                    new Date()
                ]
            })
            //            l.debug(createPeople.text, createPeople.values)
            db.one(createPeople)
                .then(user => resolve(user))
                .catch(err => reject(new Error(err)))
        })
    }

    async createPeopleFromHRA(people: IPeople): Promise<IPeople> {
        return new promise.Promise((resolve, reject) => {
            //            l.debug('Create People : ', people)

            // const cs = new pgp.helpers.ColumnSet(['people_id', 'matricule', 'tgi', 'fullname', 'firstname', 'lastname', 'posact', 'entree', 'sortie', 'hraabsences', 'lnabsences', 'createddate'], { table: 'ln_absences' });
            // const Query = pgp.helpers.insert({ people_id: null, ...people, createddate: new Date() }, cs) + ' RETURNING *'
            l.debug(people)
            const createPeople = new PQ({
                text: 'INSERT INTO people (source,matricule,tgi, createdDate) VALUES ($1, $2, $3, $4) RETURNING * ',
                values: [
                    people.source,
                    people.matricule,
                    people.tgi,
                    new Date()
                ]
            })
            //            l.debug(createPeople.text, createPeople.values)
            db.one(createPeople)
                .then(user => resolve(user))
                .catch(err => {
                    l.error(err)
                    reject(err)
                })
        })
    }

    async updatePeople(id: string, people: IPeople): Promise<IPeople> {
        return new promise.Promise((resolve, reject) => {
            const updatePeople = new PQ({
                //                text: 'UPDATE people SET matricule = $2, tgi=$3, fullname=$4, firstname=$5, lastname=$6, posact=$7, entree=$8, sortie=$9, HRA_Absences=$10, LN_Absences=$11 WHERE people_id = $1 RETURNING *;',
                text: 'UPDATE people SET firstname=$2, lastname=$3, posact=$4, entree=$5, sortie=$6 WHERE people_id = $1 RETURNING *;',
                values: [
                    id,
                    // people.matricule,
                    // people.tgi,
                    //people.fullname,
                    people.firstname,
                    people.lastname,
                    people.posact,
                    people.entree,
                    people.sortie,
                ]
            })
            db.one(updatePeople)
                .then(people => resolve(people))
                .catch(err => reject(err))
        })

    }

    // async updatePeopleWithHRA_Absences(id: Number, HRA_Absences: [string]) {
    //     return new promise.Promise((resolve, reject) => {
    //         const updateHRA = new PQ({
    //             //                text: 'UPDATE people SET matricule = $2, tgi=$3, fullname=$4, firstname=$5, lastname=$6, posact=$7, entree=$8, sortie=$9, HRA_Absences=$10, LN_Absences=$11 WHERE people_id = $1 RETURNING *;',
    //             text: 'UPDATE people SET HRA_Absences=$2 WHERE people_id = $1 RETURNING *;',
    //             values: [
    //                 id,
    //                 HRA_Absences,
    //             ]
    //         })
    //         db.one(updateHRA)
    //             .then(people => resolve(people))
    //             .catch(err => reject(err))
    //     })
    // }

    // async updatePeopleWithLN_Absences(id: Number, LN_Absences: [string]) {
    //     return new promise.Promise((resolve, reject) => {
    //         const updateLN = new PQ({
    //             //                text: 'UPDATE people SET matricule = $2, tgi=$3, fullname=$4, firstname=$5, lastname=$6, posact=$7, entree=$8, sortie=$9, HRA_Absences=$10, LN_Absences=$11 WHERE people_id = $1 RETURNING *;',
    //             text: 'UPDATE people SET LN_Absences=$2 WHERE people_id = $1 RETURNING *;',
    //             values: [
    //                 id,
    //                 LN_Absences,
    //             ]
    //         })
    //         db.one(updateLN)
    //             .then(people => resolve(people))
    //             .catch(err => reject(err))
    //     })
    // }

    // async updatePeopleAddLN_Absences(id: Number, LN_Absences: [string]) {
    //     return new promise.Promise((resolve, reject) => {
    //         dbLN_Absence.findAbsencesIdForPeopleId(id)
    //             .then(absences => {
    //                 //                    absences.concat(LN_Absences)
    //                 l.debug('New Absences List:', _.union(LN_Absences, absences))
    //                 this.updatePeopleWithLN_Absences(id, _.union(LN_Absences, absences))
    //             })
    //             .catch(err => reject(err))
    //     })
    // }


    async findPeopleByMatricule(matricule: string): Promise<IPeople> {
        return new promise.Promise((resolve, reject) => {
            const findMatricule = new PQ({
                text: 'SELECT * FROM people WHERE matricule = $1',
                values: matricule
            })
            db.one(findMatricule)
                .then((people) => resolve(people))
                .catch(err => reject(err))
        })
    }

    async findPeopleByTGI(tgi: string): Promise<IPeople> {
        return new promise.Promise((resolve, reject) => {
            const findTGI = new PQ({
                text: 'SELECT * FROM people WHERE tgi = $1',
                values: tgi
            })
            db.one(findTGI)
                .then((people) => resolve(people))
                .catch(err => reject(err))
        })
    }
    async findPeopleById(userId: string): Promise<IPeople> {
        return new promise.Promise((resolve, reject) => {
            const findId = new PQ({
                text: 'SELECT * FROM people WHERE people_id = $1',
                values: userId
            })
            db.one(findId)
                .then((people) => resolve(people))
                .catch(err => reject(err))
        })
    }

    async findPeopleByName(fullName: string): Promise<IPeople> {
        return new promise.Promise((resolve, reject) => {
            const findName = new PQ({
                text: 'SELECT * FROM people WHERE fullname = $1',
                values: fullName
            })
            db.one(findName)
                .then((people) => resolve(people))
                .catch(err => reject(err))
        })
    }

    async findAllPeople(): Promise<IPeople[]> {
        return new promise.Promise((resolve, reject) => {
            const findAll = new PQ({
                text: 'SELECT * FROM people',
            })
            db.manyOrNone(findAll)
                .then(peoples => resolve(peoples))
                .catch(err => reject(err))
        })
        //        return await People.find();
    }

    async deletePeople(id: string): Promise<IPeople> {
        return new promise.Promise((resolve, reject) => {
            const deletePeople = new PQ({
                text: 'DELETE FROM people WHERE people_id = $1 RETURNING *;',
                values: id
            })
            db.one(deletePeople)
                .then(deletedPeople => resolve(deletedPeople))
                .catch(err => reject(err))
        })
        // l.debug('Deleting peopleId : ', id);
        // return await People.findOneAndDelete({ people_id: id });
    }

    // async addUserInGroup(userId: string, groupId: string){
    //     l.debug('Adding userId : ', userId, ' in groupId : ', groupId );
    //     await User.findOne({user_id: userId}, (update) => {
    //         update.groups.push(groupId);
    //         return User.findOneAndUpdate({user_id: userId}, update);
    //     })

    // }

    // async findUsersInGroup(groupId: string): Promise<IUser> {
    //     l.debug('Getting Users in Group : ', groupId);
    //     await User.find({user.groups})
    // }

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

}


export const dbPeople = new peopleService();



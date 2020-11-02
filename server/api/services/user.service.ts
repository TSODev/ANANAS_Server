import * as promise from 'bluebird'; // best promise library today

import l from '../../common/logger';
import mongoose from 'mongoose';
import { IUser } from '../models/users.model';
import * as _ from 'lodash';

import db from '../../common/dbPostGresConnect'
import pg from 'pg-promise/typescript/pg-subset';

const { ParameterizedQuery: PQ } = require('pg-promise');

class userService {



    async allPGUsers(): Promise<{ error: boolean; data: any; }> {
        let answer = { error: false, data: '' }
        try {
            const response = await db.any('SELECT * FROM "TEST"', [true])
            answer = { error: false, data: response }
        } catch (err) {
            answer = { error: true, data: err }
        }
        return answer
    }



    isAdmin(user: IUser) {
        return ((_.intersection(user.roles, ['ADMIN'])).length > 0);
    }


    async createUser(credentials, passwordDigest: string) {
        return new promise.Promise((resolve, reject) => {
            const findUser = new PQ({ text: 'SELECT user_id FROM Users WHERE email = $1', values: credentials.email });
            l.debug('Query findUserByEmail :', findUser.text)
            db.none(findUser)
                .then(() => {
                    l.debug('dbCreate User : no user found')
                    // User does not exist so we can create a new one !
                    const query = new PQ(
                        {
                            text: 'INSERT INTO users (email, passwordDigest, firstname, lastname, roles, createdDate) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, email, passwordDigest, firstname, lastname, roles',
                            values:
                                [
                                    credentials.email,
                                    passwordDigest,
                                    credentials.firstName,
                                    credentials.lastName,
                                    credentials.roles,
                                    new Date(),
                                ]
                        })
                    db.one(query)
                        .then(user => {
                            l.debug(user)
                            resolve(user)
                        })
                        .catch(e => l.error(e))
                })
                .catch((user) => {
                    // l.debug('dbCreate User : user already exist')
                    // l.debug(new Error(JSON.stringify({ message: 'user already exist', value: user.result.rows })))
                    reject(new Error(JSON.stringify({ message: 'user already exist', value: user.result.rows[0] })))
                })
        })


    }


    async findUserByEmail(email: string): Promise<IUser> {
        return new promise.Promise((resolve, reject) => {
            this.dbConnect()
                .then(version => {
                    const findUser = new PQ({ text: 'SELECT * FROM Users WHERE email = $1', values: email });
                    //            const query = 'SELECT * FROM users WHERE email = $1',
                    l.debug('[findUserByEmail]', findUser.text)
                    db.one(findUser)
                        .then((user) => resolve(user))
                        .catch((err) => reject(err))
                })
                .catch(err => {
                    l.error(err.message)
                    reject(err)
                })
            //     const findUser = new PQ({ text: 'SELECT * FROM Users WHERE email = $1', values: email });
            //     //            const query = 'SELECT * FROM users WHERE email = $1',
            //     l.debug('[findUserByEmail]', findUser.text)
            //     db.one(findUser)
            //         .then((user) => resolve(user))
            //         .catch((err) => reject(err))
            // })
        }
        )
    }


    async findUserById(userId: string): Promise<IUser> {
        return new promise.Promise((resolve, reject) => {
            const findUser = new PQ({ text: 'SELECT * FROM Users WHERE user_id = $1', values: userId });
            db.one(findUser)
                .then((user) => resolve(user))
                .catch((err) => reject(err))
        })
    }


    async findAllUsers(): Promise<IUser[]> {
        return new promise.Promise((resolve, reject) => {
            const findUsers = new PQ({ text: 'SELECT * FROM Users' })
            db.many((findUsers))
                .then(users => resolve(users))
                .catch(err => reject(err))
        })
    }


    async deleteUser(id: string): Promise<IUser> {
        return new promise.Promise((resolve, reject) => {
            l.debug('Deleting User :', id)
            const deleteUser = new PQ({
                text: 'DELETE FROM users WHERE user_id = $1',
                values: id
            })
            db.one(deleteUser)
                .then(nbRowDeleted => resolve(nbRowDeleted))
                .catch(err => reject(err))
        })

    }

    async dbConnect(): Promise<string> {
        return new promise.Promise((resolve, reject) => {
            db.connect()
                .then(obj => {
                    resolve(obj.client.serverVersion)
                    obj.done()
                })
                .catch(err => reject(err))
        })
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


export const dbUser = new userService();



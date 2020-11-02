import * as promise from 'bluebird'; // best promise library today
import db, { pgp } from '../../common/dbPostGresConnect';
import l from "../../common/logger";


const { QueryFile } = require('pg-promise');
const { join: joinPath } = require('path');

// Helper for linking to external query files:
function sql(file) {
    const fullPath = joinPath(__dirname, file); // generating full path;
    const qf = new QueryFile(fullPath, { minify: false, debug: true })
    return qf;
}

const sqlDropDB = sql('../models/SQL/drop_DATABASE.sql');
const sqlCreateDB = sql('../models/SQL/create_DATABASE.sql');
const sqlCreateSchema = sql('../models/SQL/create_SCHEMA.sql');
const sqlCreateUsers = sql('../models/SQL/create_users.sql')
const sqlInitUsers = sql('../models/SQL/init_users.sql')
const sqlCreatePeople = sql('../models/SQL/create_people.sql')
const sqlCreateMetadata = sql('../models/SQL/create_metadata.sql')
const sqlInitMetadata = sql('../models/SQL/init_metadata.sql')
const sqlCreateLNTable = sql('../models/SQL/create_LN_Absences.sql')
const sqlCreateLNView = sql('../models/SQL/create_LN_view.sql')
const sqlCreateHRATable = sql('../models/SQL/create_HRA_Absences.sql')
const sqlCreateHRAView = sql('../models/SQL/create_HRA_view.sql')
const sqlCreateDatafiles = sql('../models/SQL/create_datafiles.sql')
const sqlCreateAnomalieTable = sql('../models/SQL/create_Anomalies.sql')
const sqlCreateAnomalieView = sql('../models/SQL/create_Anomalies_view.sql')
const sqlReadSchemaInfo = sql('../models/SQL/read_schema.sql')
const sqlReadDatabaseInfo = sql('../models/SQL/read_DATABASE.sql')


class databaseService {



    async dropDB(): Promise<any> {
        return new promise.Promise((resolve, reject) => {

            pgp({
                host: process.env.PGHOST,
                port: process.env.PGPORT,
                database: 'postgres',
                user: process.env.PGUSER,
                password: process.env.PGPASSWORD,
            }).none(sqlDropDB)
                .then((response) => {
                    resolve(response)
                })
                .catch(err => {
                    l.error(err)
                    reject(err)
                })
        })
    }

    async createDB(): Promise<any> {
        return new promise.Promise((resolve, reject) => {

            pgp({
                host: process.env.PGHOST,
                port: process.env.PGPORT,
                database: 'postgres',
                user: process.env.PGUSER,
                password: process.env.PGPASSWORD,
            }).none(sqlCreateDB)
                .then((response) => {
                    db.none(sqlCreateSchema)
                        .then(response => {
                            resolve('OK')
                        }
                        )
                        .catch(err => {
                            l.error(err)
                            reject(err)
                        })
                })
                .catch(err => {
                    l.error(err)
                    reject(err)
                })
        })
    }


    async initUsersDB(): Promise<any> {
        return new promise.Promise((resolve, reject) => {
            db.none(sqlCreateUsers)
                .then(response => {
                    db.any(sqlInitUsers)
                        .then((response) => resolve('OK'))
                        .catch(err => reject(err))
                })
                .catch(err => reject(err))
        })
    }

    async initPeopleDB(): Promise<any> {
        return new promise.Promise((resolve, reject) => {
            db.none(sqlCreatePeople)
                .then((response) => resolve('OK'))
                .catch(err => reject(err))
        })
    }

    async initMetadataDB(): Promise<any> {
        return new promise.Promise((resolve, reject) => {
            db.none(sqlCreateMetadata)
                .then(response => {
                    db.any(sqlInitMetadata)
                        .then((response) => resolve('OK'))
                        .catch(err => reject(err))
                })
                .catch(err => reject(err))
        })
    }

    async initLN(): Promise<any> {
        return new promise.Promise((resolve, reject) => {
            db.none(sqlCreateLNTable)
                .then(response => {
                    db.none(sqlCreateLNView)
                        .then((response) => resolve('OK'))
                        .catch(err => reject(err))
                })
                .catch(err => reject(err))
        })
    }

    async initHRA(): Promise<any> {
        return new promise.Promise((resolve, reject) => {
            db.none(sqlCreateHRATable)
                .then(response => {
                    db.none(sqlCreateHRAView)
                        .then((response) => resolve('OK'))
                        .catch(err => reject(err))
                })
                .catch(err => reject(err))
        })
    }

    async initDatafileDB(): Promise<any> {
        return new promise.Promise((resolve, reject) => {
            db.none(sqlCreateDatafiles)
                .then((response) => resolve('OK'))
                .catch(err => reject(err))
        })
    }

    async initAnomalies(): Promise<any> {
        return new promise.Promise((resolve, reject) => {
            db.none(sqlCreateAnomalieTable)
                .then(response => {
                    db.none(sqlCreateAnomalieView)
                        .then((response) => resolve('OK'))
                        .catch(err => reject(err))
                })
                .catch(err => reject(err))
        })
    }

    async schemaDB(): Promise<any> {
        return new promise.Promise((resolve, reject) => {
            db.one(sqlReadSchemaInfo)
                .then((response) => resolve(response))
                .catch(err => reject(err))
        })
    }

    async databaseDB(): Promise<any> {
        return new promise.Promise((resolve, reject) => {
            db.one(sqlReadDatabaseInfo)
                .then((response) => resolve(response))
                .catch(err => reject(err))
        })
    }
}


export const dbService = new databaseService();

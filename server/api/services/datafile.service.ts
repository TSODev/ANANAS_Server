import Bluebird, * as promise from 'bluebird'; // best promise library today

import l from '../../common/logger';


import db from '../../common/dbPostGresConnect'
import { IDataFile } from '../models/datafiles.model'
import { pgp } from '../../common/dbPostGresConnect'

const { ParameterizedQuery: PQ } = require('pg-promise');
var moment = require('moment')
var fr = moment().locale('fr');



class dataFileService {

    async create(md: IDataFile): Promise<IDataFile> {
        return new promise.Promise((resolve, reject) => {

            const cs = new pgp.helpers.ColumnSet(['datafilename', 'datafileloaddate', 'createddate'], { table: 'datafiles' });
            const Query = pgp.helpers.insert(md, cs) + ' RETURNING *'

            db.one(Query)
                .then(data => resolve(data))
                .catch(err => reject(err))
        })
    }

    async update(df: IDataFile): Promise<IDataFile> {
        return new promise.Promise((resolve, reject) => {

            const cs = new pgp.helpers.ColumnSet(['datafilename', 'datafileloaddate', 'createddate'], { table: 'datafiles' });
            const condition = pgp.as.format(' WHERE datafile_id = $1 AND metadata_key = $2', df.datafile_id);
            //   l.debug('UPDATE METADATA :', condition)
            const Query = pgp.helpers.update(df, cs) + condition + ' RETURNING datafile_id'

            l.debug('UPDATE DATAFILE :', Query)

            db.one(Query)
                .then(data => resolve(data))
                .catch(err => reject(err))
        })
    }

    async getById(id: number): Promise<IDataFile> {
        return new promise.Promise((resolve, reject) => {
            const findId = new PQ({
                text: 'SELECT * FROM datafiles WHERE datafile_id = $1',
                values: id
            })
            db.one(findId)
                .then((datafile) => resolve(datafile))
                .catch(err => reject(err))
        })

    }

    async getAll(): Promise<IDataFile[]> {
        return new promise.Promise((resolve, reject) => {
            const findId = new PQ({
                text: 'SELECT * FROM datafiles '
            })
            db.manyOrNone(findId)
                .then((datafiles) => resolve(datafiles))
                .catch(err => reject(err))
        })

    }

    async delete(id: number): Promise<IDataFile> {
        return new promise.Promise((resolve, reject) => {
            const findId = new PQ({
                text: 'DELETE from datafiles WHERE datafile_id = $1 RETURNING *',
                values: id
            })
            db.one(findId)
                .then(deleted_datafile => resolve(deleted_datafile))
                .catch(err => reject(err))
        })
    }

}

export const dbDataFiles = new dataFileService()

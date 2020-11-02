import Bluebird, * as promise from 'bluebird'; // best promise library today

import l from '../../common/logger';


import db from '../../common/dbPostGresConnect'
import { IMetadata } from '../models/metadata.model'
import { pgp } from '../../common/dbPostGresConnect'

const { ParameterizedQuery: PQ } = require('pg-promise');
var moment = require('moment')
var fr = moment().locale('fr');



class metadataService {

    async create(md: IMetadata): Promise<IMetadata> {
        return new promise.Promise((resolve, reject) => {

            const cs = new pgp.helpers.ColumnSet(['metadata_group', 'metadata_key', 'metadata_value', 'createddate'], { table: 'metadata' });
            const Query = pgp.helpers.insert(md, cs) + ' RETURNING _id'

            db.one(Query)
                .then(data => resolve(data))
                .catch(err => reject(err))
        })
    }

    async update(md: IMetadata): Promise<IMetadata> {
        return new promise.Promise((resolve, reject) => {

            const cs = new pgp.helpers.ColumnSet(['metadata_group', 'metadata_key', 'metadata_value', 'createddate'], { table: 'metadata' });
            const condition = pgp.as.format(' WHERE metadata_group = $1 AND metadata_key = $2', [md.metadata_group, md.metadata_key]);
            //   l.debug('UPDATE METADATA :', condition)
            const Query = pgp.helpers.update(md, cs) + condition + ' RETURNING _id'

            l.debug('UPDATE METADATA :', Query)

            db.one(Query)
                .then(data => resolve(data))
                .catch(err => reject(err))
        })
    }

    async getById(id: number): Promise<IMetadata> {
        return new promise.Promise((resolve, reject) => {
            const findId = new PQ({
                text: 'SELECT * FROM metadata WHERE _id = $1',
                values: id
            })
            db.one(findId)
                .then((metadata) => resolve(metadata))
                .catch(err => reject(err))
        })

    }

    async getAll(): Promise<IMetadata> {
        return new promise.Promise((resolve, reject) => {
            const findId = new PQ({
                text: 'SELECT * FROM metadata '
            })
            db.manyOrNone(findId)
                .then((metadata) => resolve(metadata))
                .catch(err => reject(err))
        })

    }

}

export const dbMetadata = new metadataService()

//import UserService from '../../services/users.service';
import { Request, Response } from 'express';

//import { dbUser } from '../../../dbUser/database.mongo';
import { dbAnomalies } from '../../services/anomalies.service';

import l from '../../../common/logger';
//import { DbUser } from '../../../dbUser/dbUser-user';
import { IAnomalie } from '../../models/anomalies.model';
import { dbMetadata } from '../../services/metadata.service';

const db = require('../../../common/dbPostGresConnect')

var moment = require('moment'); // require
var fr = moment().locale('fr');

export class anomalieController {

    async analyseForAllPeople(req: Request, res: Response) {
        dbAnomalies.bulkAnalyse()
            .then(async anomalies => {
                try {
                    await dbMetadata.update({
                        metadata_key: 'lastLoaded',
                        metadata_value: fr.format("dddd Do MMMM YYYY à HH:mm:ss"),
                        metadata_group: 'ANOMALIES',
                        createddate: new Date()
                    })
                } catch (error) {
                    l.error(error.message)
                }
                res.status(200).json(anomalies)
            })
            .catch(err => res.status(400).send(err.message))
    }

    async analyseForPeopleId(req: Request, res: Response) {
        const id = req.params['id'];
        dbAnomalies.analyseForPeopleId(parseInt(id))
            .then(anomalies => res.status(200).json(anomalies))
            .catch(err => res.status(400).send(err.message))
    }

    async clearAnomalies(req: Request, res: Response) {
        dbAnomalies.clearCollection()
            .then(() => res.status(200).send('Anomalies Collection cleared'))
            .catch((err) => res.status(400).send(err.message))
    }

    async getAllFromView(req: Request, res: Response) {
        dbAnomalies.getAllFromView()
            .then((anomalies) => res.status(200).json(anomalies))
            .catch((err) => res.status(400).send(err.message))
    }

    async updateAnomalieWithEtatAndComment(req: Request, res: Response) {
        const data = req.body;
        dbAnomalies.updateAnomalieWithEtatAndComment(data)
            .then((anomalieId) => res.status(200).json(anomalieId))
            .catch((err) => res.status(400).send(err.message))
    }

}
export default new anomalieController();

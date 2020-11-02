import e, { Request, Response } from 'express';
import { dbService } from '../../services/database.service'

export class dataBaseController {

    async drop(req: Request, res: Response) {
        dbService.dropDB()
            .then(answer => res.status(200).send(answer))
            .catch(err => res.status(400).send(err))

    }

    async create(req: Request, res: Response) {
        dbService.createDB()
            .then(() => dbService.initUsersDB()
                .then(() => dbService.initMetadataDB()
                    .then(answer => res.status(200).send(answer))))
            .catch(err => res.status(400).send(err))

    }

    async init(req: Request, res: Response) {
        dbService.createDB()
            .then(() => dbService.initUsersDB()
                .then(() => dbService.initMetadataDB()
                    .then(() => dbService.initPeopleDB()
                        .then(answer => res.status(200).send(answer)))))
            .catch(err => res.status(400).send(err))

    }

    async initPeople(req: Request, res: Response) {
        dbService.initPeopleDB()
            .then(answer => res.status(200).send(answer))
            .catch(err => res.status(400).send(err))

    }

    async initLN(req: Request, res: Response) {
        dbService.initLN()
            .then(answer => res.status(200).send(answer))
            .catch(err => res.status(400).send(err))

    }

    async initHRA(req: Request, res: Response) {
        dbService.initHRA()
            .then(answer => res.status(200).send(answer))
            .catch(err => res.status(400).send(err))

    }

    async initDatafile(req: Request, res: Response) {
        dbService.initDatafileDB()
            .then(answer => res.status(200).send(answer))
            .catch(err => res.status(400).send(err))

    }

    async initAnomalies(req: Request, res: Response) {
        dbService.initAnomalies()
            .then(answer => res.status(200).send(answer))
            .catch(err => res.status(400).send(err))

    }

    async readSchema(req: Request, res: Response) {
        dbService.schemaDB()
            .then(answer => res.status(200).send(answer))
            .catch(err => res.status(400).send(err))

    }

    async readDatabase(req: Request, res: Response) {
        dbService.databaseDB()
            .then(answer => res.status(200).send(answer))
            .catch(err => res.status(400).send(err))

    }
}

export default new dataBaseController();
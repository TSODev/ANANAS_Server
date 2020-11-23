//import UserService from '../../services/users.service';
import { Request, Response } from 'express';

//import { dbUser } from '../../../dbUser/database.mongo';
import { dbPeople } from '../../services/people.service';

import l from '../../../common/logger';
//import { DbUser } from '../../../dbUser/dbUser-user';
import { IPeople } from '../../models/people.model';

const db = require('../../../common/dbPostGresConnect')

export class peopleController {

    async allPeople(req: Request, res: Response) {
        dbPeople.findAllPeople()
            .then(people => {
                res.status(200).json({ people: people })
            })
            .catch(err => {
                res.status(400).send({ message: err.message })
            })
    }

    async allPeopleFromLNSource(req: Request, res: Response) {
        dbPeople.findAllPeopleFromLNSource()
            .then(people => {
                res.status(200).json({ people: people })
            })
            .catch(err => {
                res.status(400).send({ message: err.message })
            })
    }


    createPeople(req: Request, res: Response): void {
        //        if (!db.dbConnected) res.sendStatus(500);
        const people_data = req.body;
        l.debug('[PEOPLECONTROLLER] - People : ', people_data);
        const errors = validatePeopleInfo(people_data);
        //    const errors = validatePassword(credentials.password);
        //    const errors = '';
        if (errors.length > 0) {
            res.status(400).json(errors);
        } else {
            dbPeople.createPeople(people_data)
                .then(user => {
                    l.debug('[PEOPLECONTROLLER] - Created : ', user)
                    res.status(200).json(user)
                })
                .catch((err) => {
                    l.error(err)
                    res.status(400).send({
                        message: err.message
                    })
                });
        }
    }




    async getPeople(req: Request, res: Response) {
        if (!db.dbConnected) res.sendStatus(500);
        l.debug("[PeopleCONTROLLER] - looking for current People (id): ", req["peopleId"]);
        const people = await dbPeople.findPeopleById(req["peopleId"]);

        if (people) {
            res.status(200).json({ people: people });
        } else {
            res.sendStatus(204);
        }
    }

    async getPeopleById(req: Request, res: Response) {
        const id = req.params['id'];
        l.debug("[PEOPLECONTROLLER] - looking for peopleId: ", id);
        dbPeople.findPeopleById(id)
            .then(people => res.status(200).json({ people: people }))
            .catch(err => res.status(400).send({ message: err.message }))
    }

    async getPeopleByName(req: Request, res: Response) {
        const fullName = req.query['fullname'].toString()
        l.debug("[PEOPLECONTROLLER] - looking for people fullName: ", fullName);
        dbPeople.findPeopleByName(fullName)
            .then(people => res.status(200).json({ people: people }))
            .catch(err => res.status(400).send({ message: err.message }))
    }

    async getPeopleByMatricule(req: Request, res: Response) {
        const fullName = req.query['matricule'].toString()
        l.debug("[PEOPLECONTROLLER] - looking for people matricule: ", fullName);
        dbPeople.findPeopleByMatricule(fullName)
            .then(people => res.status(200).json({ people: people }))
            .catch(err => res.status(400).send({ message: err.message }))
    }

    async getPeopleByTGI(req: Request, res: Response) {
        const fullName = req.query['tgi'].toString()
        l.debug("[PEOPLECONTROLLER] - looking for people tgi: ", fullName);
        dbPeople.findPeopleByTGI(fullName)
            .then(people => res.status(200).json({ people: people }))
            .catch(err => res.status(400).send({ message: err.message }))
    }

    async updatePeopleById(req: Request, res: Response) {

        const id = req.params['id'];
        const newPeople = req.body;
        l.debug("[PEOPLECONTROLLER] - looking for peopleId: ", id);
        l.debug("[PEOPLECONTROLLER] - updating with: ", newPeople);

        dbPeople.updatePeople(id, newPeople)
            .then(people => res.status(200).json({ people: people }))
            .catch(err => res.status(400).send({ message: err.message }))
    }

    async deletePeople(req: Request, res: Response) {
        const id = req.params['id'];
        l.debug("[PEOPLECONTROLLER] - Deleteing for peopleId: ", id);
        dbPeople.deletePeople(id)
            .then(people => res.status(200).json({ people: people }))
            .catch(err => res.status(400).send({ message: err.message }))
    }
}

//---------------------------------------------------------------------------------------

async function createPeople(res: Response, people_data) {
    try {
        const people = await dbPeople.createPeople(people_data);
        res.status(200).json({ people: people_data })
    } catch {
        res.status(500).json({ error: 'People already exist' })
    }
}



function validatePeopleInfo(people_data) {
    var errors = '';
    return errors;
}

export default new peopleController();

import express from 'express';
import * as _ from 'underscore';

import usercontroller from './user.controller';

import { checkIfAuthenticated } from '../../../authentication/auth.middleware';
import { checkCsrfToken } from '../../../common/csrf.middleware';
import { checkIfAuthorized } from '../../../autorization/autorization.middleware';
import l from '../../../common/logger';
import metadataController from './metadata.controller'
import datafileController from './datafiles.controller'
import peopleController from './people.controller';
import HRA_absenceController from './HRA_absence.controller';
import LN_absenceController from './LN_absence.controller';
import anomaliesController from './anomalies.controller';
import databaseController from './database.controller';

var router = express.Router();

router
    //---TEST
    .get('/test', usercontroller.TestPG)
    //--- DATABASE Initializtion
    .get('/db/schema', databaseController.readSchema)
    .get('/db/database', databaseController.readDatabase)
    .get('/db/drop', databaseController.drop)
    .get('/db/create', databaseController.create)
    .get('/db/initPeople', databaseController.initPeople)
    .get('/db/initLN', databaseController.initLN)
    .get('/db/initHRA', databaseController.initHRA)
    .get('/db/initDatafile', databaseController.initDatafile)
    .get('/db/initAnomalies', databaseController.initAnomalies)
    //---USERS--------------------------------------------------------------------------------------
    .post('/signup', usercontroller.createUser)
    .post('/login', usercontroller.login)
    .post('/logout', checkIfAuthenticated, checkCsrfToken, usercontroller.logout)
    .get('/content', checkIfAuthenticated, usercontroller.getContent)
    .get('/user', checkIfAuthenticated, usercontroller.getUser)                       // Get user email address from SESSIONID cookie
    .get('/user/:id', checkIfAuthenticated, usercontroller.getUserById)
    .get('/user/email/:email', checkIfAuthenticated, usercontroller.getUserByEmail)
    .get('/users', checkIfAuthenticated, usercontroller.allUsers)
    .delete('/user/:id', checkIfAuthenticated,
        _.partial(checkIfAuthorized, (['ADMIN']))
        , usercontroller.deleteUser)
    .get('/user/whoami', checkIfAuthenticated, usercontroller.whoAmI)
    //---METADATA
    .post('/metadata', checkIfAuthenticated, metadataController.createMetadata)
    .get('/metadata', checkIfAuthenticated, metadataController.allMetadata)
    .get('/metadata/:id', checkIfAuthenticated, metadataController.getMetadataById)
    //---DATAFILE
    .post('/datafile', checkIfAuthenticated, datafileController.createdataFile)
    .get('/datafiles', checkIfAuthenticated, datafileController.alldataFiles)
    .get('/datafile/:id', checkIfAuthenticated, datafileController.getdataFileById)
    .delete('/datafile/:id', checkIfAuthenticated, datafileController.deletedataFileById)
    //---PEOPLE--------------------------------------------------------------------------------------
    .post('/people', checkIfAuthenticated, peopleController.createPeople)
    .get('/people', checkIfAuthenticated, peopleController.getPeople)
    .get('/people/byName', checkIfAuthenticated, peopleController.getPeopleByName)
    .get('/people/byMatricule', checkIfAuthenticated, peopleController.getPeopleByMatricule)
    .get('/people/byTGI', checkIfAuthenticated, peopleController.getPeopleByTGI)                      // Get user email address from SESSIONID cookie
    .get('/people/:id', checkIfAuthenticated, peopleController.getPeopleById)
    .get('/allpeople', checkIfAuthenticated, peopleController.allPeople)
    .delete('/people/:id', checkIfAuthenticated,
        _.partial(checkIfAuthorized, (['ADMIN']))
        , peopleController.deletePeople)
    .put('/people/:id', checkIfAuthenticated, peopleController.updatePeopleById)
    //---ABSENCES--------------------------------------------------------------------------------------
    .post('/HRA/absence', checkIfAuthenticated, HRA_absenceController.createAbsence)
    .post('/HRA/absence/bulkinsert', checkIfAuthenticated, HRA_absenceController.bulkCreateAbsence)
    .get('/HRA/absence', checkIfAuthenticated, HRA_absenceController.getAbsence)
    .get('/HRA/absence/:id', checkIfAuthenticated, HRA_absenceController.getAbsenceById)
    .get('/HRA/allabsences', checkIfAuthenticated, HRA_absenceController.allAbsences)
    .get('/HRA/allabsencesview', checkIfAuthenticated, HRA_absenceController.getAbsenceView)
    .get('/HRA/absenceCodes', checkIfAuthenticated, HRA_absenceController.getDistinctCode)
    .delete('/HRA/absence/:id', checkIfAuthenticated,
        _.partial(checkIfAuthorized, (['ADMIN']))
        , HRA_absenceController.deleteAbsence)
    .delete('/HRA/absencesByLoad/:id', checkIfAuthenticated,
        _.partial(checkIfAuthorized, (['ADMIN']))
        , HRA_absenceController.deleteAbsencesByLoad)
    .post('/LN/absence', checkIfAuthenticated, LN_absenceController.createAbsence)
    .post('/LN/absence/bulkinsert', checkIfAuthenticated, LN_absenceController.bulkCreateAbsence,)
    .get('/LN/absence/:id', checkIfAuthenticated, LN_absenceController.getAbsenceById)
    .get('/LN/absencesForPeople', checkIfAuthenticated, LN_absenceController.getAbsencesForPeopleId)
    .get('/LN/allabsences', checkIfAuthenticated, LN_absenceController.allAbsences)
    .get('/LN/allabsencesview', checkIfAuthenticated, LN_absenceController.getAbsenceView)
    .get('/LN/absenceCodes', checkIfAuthenticated, LN_absenceController.getDistinctCode)
    //---ANOMALIES
    .get('/anomaliesForPeople/:id', checkIfAuthenticated, anomaliesController.analyseForPeopleId)
    .get('/anomaliesForAllPeople', checkIfAuthenticated, anomaliesController.analyseForAllPeople)
    .get('/clearanomalies', checkIfAuthenticated, anomaliesController.clearAnomalies)
    .get('/allanomaliesfromView', checkIfAuthenticated, anomaliesController.getAllFromView)
    .put('/updateanomaliewithetatandcomment', checkIfAuthenticated, anomaliesController.updateAnomalieWithEtatAndComment)


export default router;

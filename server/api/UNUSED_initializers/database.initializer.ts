//const db = require('./db'); // our database module;
import db from '../../common/dbPostGresConnect'
import l from "../../common/logger";

const { users, database } = require('./file.providers'); // sql for users;


module.exports = {
    createDatabase: () => {
        l.debug('DATABASE -> ', database.create)
        db.none(database.create)
    },
    createUsers: () => {
        l.debug('USERS -> ', users.create)
        db.none(users.create)
    },
    initUsers: () => {
        l.debug('USERS -> ', users.init)
        db.anyOrNone(users.init)
    }
};


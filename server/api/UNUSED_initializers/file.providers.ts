import l from "../../common/logger";

const { QueryFile } = require('pg-promise');
const { join: joinPath } = require('path');

// Helper for linking to external query files:
function sql(file) {
    const fullPath = joinPath(__dirname, file); // generating full path;
    //    l.debug('SQLFile : ', fullPath)
    const qf = new QueryFile(fullPath, { minify: false, debug: true })
    //    l.debug('QF : ', qf.toString())
    return qf;
}

module.exports = {
    database: {
        create: sql('SQL/create_DATABASE.sql')
    },
    users: {
        create: sql('./SQL/create_users.sql'),
        init: sql('./SQL/init_users.sql'),
    }
}
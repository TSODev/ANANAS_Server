
import l from './logger';

const promise = require('bluebird'); // or any other Promise/A+ compatible library;

l.info("Connect to database : ");
l.info("DB Server : ", process.env.PGHOST);
l.info("DB Port : ", process.env.PGPORT);
l.info("DB Name : ", process.env.PGDATABASE);


const onConnectHandler = (e) => {
    //    l.debug('[DB Connect :]', e.user, '@', e.host, ':', e.port, 'db:', e.database, ' - ', e.serverVersion)
    l.debug('[DB Connect :]', e.user, '@', e.host, ':', e.port, 'db:', e.database)
}

const onDisonnectHandler = (e) => {
    l.debug('[DB Disconnected]')
}

const onQueryHandler = (q) => {
    l.debug('[DB Query :]', q.query)
}

const onErrorHandler = (err, e) => {
    l.error('[DB Error :]', err)
}

const onReceiveHandler = (data, result, e) => {
    l.debug('[DB Receive :]', data)
}

const initOptions = {
    promiseLib: promise, // overriding the default (ES6 Promise);
    //connect: onConnectHandler,
    //disconnect: onDisonnectHandler,
    //query: onQueryHandler,
    //receive: onReceiveHandler,
    error: onErrorHandler,
    capSQL: true, // capitalize all generated SQL
    schema: 'ananas'
};

export const pgp = require('pg-promise')(initOptions);
// attach to all pg-promise events of the initOptions object:

//         Configuration Object

// string host - server name or IP address
// number port - server port number
// string database - database name
// string user - user name
// string password - user password, or a function that returns one
// boolean ssl - use SSL (it also can be an ISSLConfig-like object)
// boolean binary - binary result mode
// string client_encoding
// string application_name
// string fallback_application_name
// number idleTimeoutMillis - lifespan for unused connections
// number max - maximum size of the connection pool
// number query_timeout - query execution timeout
// boolean keepAlive - keep TCP alive

const cn = {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    max: 30 // use up to 30 connections

    // "types" - in case you want to set custom type parsers on the pool level
};

const db = pgp(cn)

export const tbl_users = new pgp.helpers.TableName({ table: 'users', schema: 'ananas' });
export const tbl_people = new pgp.helpers.TableName({ table: 'people', schema: 'ananas' });
export const tbl_LN = new pgp.helpers.TableName({ table: 'ln_absences', schema: 'ananas' });

export const cs_users = new pgp.helpers.ColumnSet([])
export const cs_people = new pgp.helpers.ColumnSet([])
export const cs_LN = new pgp.helpers.ColumnSet([])

async function isConnected(db) {
    const c = await db.connect(); // try to connect
    c.done(); // success, release connection
    return c.client.serverVersion; // return server version
}

export default db


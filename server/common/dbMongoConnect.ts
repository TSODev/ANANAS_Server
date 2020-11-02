import l from './logger';
import mongoose from 'mongoose';

class dbConnect {

    public dbConnected = false;
    // 
    constructor() {
        const connectionString = process.env.DB_CONNECTION_STRING +
            process.env.DB_ROOT +
            ':' +
            process.env.DB_PASSWORD +
            '@' +
            process.env.DB_SERVER +
            ':' +
            process.env.DB_PORT +
            '/' +
            process.env.DB_NAME +
            process.env.DB_OPTIONS;
        l.debug("Connect to database : ");
        l.debug("DB Server : ", process.env.DB_SERVER);
        l.debug("DB Port : ", process.env.DB_PORT);
        l.debug("DB Name : ", process.env.DB_NAME);
        l.debug("DB Options : ", process.env.DB_OPTIONS);

        const mongo_Connection_Options = {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useFindAndModify: false,
        }

        mongoose.connect(connectionString, mongo_Connection_Options).then(
            () => { /** ready to use. The `mongoose.connect()` promise resolves to mongoose instance. */
                l.debug('Connected !');
                this.dbConnected = true;
            },
            err => { /** handle initial connection error */
                l.debug('Connection Error : ', err);
            }
        );

        mongoose.connection.on('error', err => {
            l.error('MongoDB: ', err);
            l.error('If you are using MongoDB Atlas (cloud), please verify your IP address is whitelisted in the Network Access Security tab ...');
            this.dbConnected = false;
        });

        mongoose.connection.once('connected', () => {
            l.debug('MongoDB database connection established successfully');
            this.dbConnected = true;
        })

        //            mongoose.Promise = global.Promise;
    }

    disconnect() {
        l.debug('Closing DB Connection');
        mongoose.connection.close(err => l.error('Error closing DB connection', err));
    }

    isDbConnected() {
        return this.dbConnected;
    }

}

export default new dbConnect;
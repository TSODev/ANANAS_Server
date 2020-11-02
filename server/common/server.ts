import express from 'express';
import { Application } from 'express';
import helmet from 'helmet';
import path from 'path';
import bodyParser from 'body-parser';
import http from 'http';
import * as https from 'https';
import os from 'os';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import l from './logger';
import * as fs from 'fs';
import { retrieveUserIdFromRequest } from './sessioncookie.middleware';
import { httpLogger } from './httplogger.middleware';
//import database from './dbMongoConnect';
import db from './dbPostGresConnect'

import appRouter from '../api/controllers/app/router';

const app = express();

let httpServer = null;
let server = null;


// const intervalObj = setInterval(() => {
//   l.debug('interviewing the interval');
// }, (+process.env.SESSION_DURATION - 50) * 1000);

export default class ExpressServer {
  constructor() {
    const root = path.normalize(__dirname + '/../..');
    app.set('appPath', root);

    // var envList = process.env.ALLOWED_ORIGINS;
    // var regexp = /(?<=\[).+?(?=\])/gi;
    // var matches = envList.match(regexp);
    // matches.map(allowed => l.debug('Allowed HTTP Request Origin :', allowed));

    const corsOptions = {
      // origin: function (origin, callback) {
      //   if (matches.indexOf(origin) !== -1 || !origin) {
      //     callback(null, true)
      //   } else {
      //     l.error(origin, 'is not allowed by CORS');
      //     callback(new Error('Origin is not allowed by CORS'))
      //   }
      // },
      origin: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true,
      allowedHeaders: ['Content-Type', 'x-xsrf-token'],
      exposedHeaders: ['Content-Type', 'Authorization']
    };

    //    app.use(debugResponse);
    app.use(helmet());
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));
    app.use(httpLogger);

    app.use(cookieParser(process.env.SESSION_SECRET));
    app.use(retrieveUserIdFromRequest);                 //need cookieParser to retrive userId from cookie    
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(`${root}/public`));



    app.use('/api/v1', appRouter);


  }


  listen(p: string | number = process.env.PORT): Application {

    const welcome = port => () => l.debug(`up and running in ${process.env.NODE_ENV || 'development'} @: ${os.hostname()} on port: ${port}}`);

    if (process.env.RUN_MODE === 'secure') {
      const options = {
        key: fs.readFileSync('./server/common/tsodev_2020.key'),
        cert: fs.readFileSync('./server/common/tsodev_2020.crt'),
        passphrase: 'MENTHE'
      };
      l.debug('Starting in secure mode...');
      //   server = https.createServer(options, app).listen(p, welcome(p));
      // } else {
      //   server = http.createServer(app).listen(p, welcome(p));
      // }
      httpServer = https.createServer(options, app)
    } else {
      httpServer = http.createServer(app)
    }
    httpServer.setTimeout(500000);

    server = httpServer.listen(p, welcome(p))




    // quit on ctrl-c when running docker in terminal
    process.on('SIGINT', () => {
      l.info('SIGINT signal received.');
      l.debug('Closing http server.');
      server.close(() => {
        l.debug('Http server closed.');
        // boolean means [force], see in mongoose doc
        //        database.disconnect();
        //        clearInterval(intervalObj);
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      l.info('SIGTERM signal received.');
      l.debug('Closing http server.');
      server.close(() => {
        l.debug('Http server closed.');
        // boolean means [force], see in mongoose doc
        //        database.disconnect();
        //        clearInterval(intervalObj);
        process.exit(0);
      });
    });

    server.on('error', onError);
    server.on('listening', onListening);



    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
      if (error.syscall !== 'listen') {
        throw error;
      }

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error('port is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
      var addr = server.address();
      var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
      l.debug('Listening on ' + bind);

    }

    return app;
  }
}
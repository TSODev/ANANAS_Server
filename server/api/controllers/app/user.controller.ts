//import UserService from '../../services/users.service';
import e, { Request, Response } from 'express';

//import { dbUser } from '../../../dbUser/database.mongo';
import { dbUser } from '../../services/user.service';
import argon2 from 'argon2';
import { createSessionToken, createCsrfToken } from "../../../authentication/security.utils";
import l from '../../../common/logger';
//import { DbUser } from '../../../dbUser/dbUser-user';
import { IUser } from '../../models/users.model';
//import { db } from '../../../common/dbPostGresConnect';


const db = require('../../../common/dbPostGresConnect')


export class userController {


  async TestPG(req: Request, res: Response) {
    const answer = await dbUser.allPGUsers()
    if (!answer.error)
      res.status(200).json(answer.data)
    else
      res.status(500)
  }

  async whoAmI(req: Request, res: Response) {
    return await dbUser.findUserById(req['userId'].sub);
  }

  async allUsers(req: Request, res: Response) {
    //    if (!db.isDbConnected) res.sendStatus(500);
    dbUser.findAllUsers()
      .then(users => {
        res.status(200).json({ users: users });
      })
      .catch(err => {
        l.error(err)
        res.status(400).send({ message: err.message })
      })

  }


  createUser(req: Request, res: Response): void {
    //    if (!db.dbConnected) res.sendStatus(500);
    const credentials = req.body;
    l.debug('[USERCONTROLLER] - Register User : ', credentials);
    const errors = validateCredentials(credentials);
    if (errors.length > 0) {
      res.status(400).json(errors);
    } else {
      createUserAndSession(res, credentials)
        .then((user) => {
          l.debug('[USERCONTROLLER] - User created:', user)
          res.status(200).json(user)
        })
        .catch((err) => {
          l.debug(JSON.parse(err.message).value["user_id"])
          const user_id = JSON.parse(err.message).value["user_id"]
          dbUser.findUserById(user_id)
            .then(user => {
              res.status(200).json(user)
            })
            .catch(e => {
              l.error(e)
              res.status(400).send({ message: e.message })
            })
        });
    }
  }

  async login(req: Request, res: Response) {

    //  if (!db.dbConnected) res.sendStatus(500);

    const credentials = req.body;
    //    const user = await dbUser.findUserByEmail(credentials.email);

    dbUser.findUserByEmail(credentials.email)
      .then(user => {
        l.debug(user)
        loginAndBuildResponse(credentials, user, res)
      })
      .catch(err => {
        l.error(err)
        res.status(400).send(err)
      })

  }

  async logout(req: Request, res: Response) {
    l.debug("[USERCONTROLLER] - Logout");
    res.clearCookie("SESSIONID");
    res.clearCookie("XSRF-TOKEN");
    res.status(200).json({ message: 'Logout Successful' });
  }

  getContent(req: Request, res: Response) {
    l.debug("[USERCONTROLLER] - GetContent");
    res.status(200).json({ contenu: 'ceci est un test' });
  }

  async getUser(req: Request, res: Response) {
    if (!db.dbConnected) res.sendStatus(500);
    l.debug("[USERCONTROLLER] - looking for current User (id): ", req["userId"]);
    const user = await dbUser.findUserById(req["userId"].sub);

    if (user) {
      res.status(200).json({ user: user });
    } else {
      res.sendStatus(204);
    }
  }

  async getUserById(req: Request, res: Response) {
    if (!db.dbConnected) res.sendStatus(500);
    const id = req.params['id'];
    l.debug("[USERCONTROLLER] - looking for userId: ", id);
    const user = await dbUser.findUserById(id);
    if (user) {
      res.status(200).json({ user: user });
    } else {
      res.sendStatus(204);
    }
  }


  async getUserByEmail(req: Request, res: Response) {

    const email = req.params['email'];
    l.debug("[USERCONTROLLER] - looking for user email: ", email);

    dbUser.findUserByEmail(email)
      .then(user => {
        res.status(200).json({ user: user });
      })
      .catch(err => {
        l.error(err)
        res.status(400).send({ message: err.message })
      })
  }

  async deleteUser(req: Request, res: Response) {
    l.debug('[USERCONTROLLER] - Request for delete userId:', req.params.id);
    dbUser.deleteUser(req.params.id)
      .then(nb => {
        l.debug(nb, 'rows deleted')
        res.send(201)
      })
      .catch(err => {
        l.error(err)
        res.status(400).send({ message: err.message })
      })
    const user = await dbUser.deleteUser(req.params.id)
      .catch(err => res.sendStatus(500));
    res.sendStatus(201);
  }
}

//---------------------------------------------------------------------------------------

async function createUserAndSession(res: Response, credentials) {

  return new Promise((resolve, reject) => {

    //    const passwordDigest = await argon2.hash(credentials.password);
    argon2.hash(credentials.password)
      .then(passwordDigest => {
        l.debug('Credentials :', credentials)
        l.debug('PasswordDigest : ', passwordDigest)

        // const user = await dbUser.createUser(credentials, passwordDigest)
        // l.debug('User : ', user)
        // const token = await createSessionToken(user)
        // l.debug('Token :', token)
        // const csrf = await createCsrfToken(token)
        // l.debug('CSFR : ', csrf)
        // res.status(200).json({ user: user })


        dbUser.createUser(credentials, passwordDigest)
          .then(user => {
            l.debug('Create User :', user)
            createSessionToken(user)
              .then(token => {
                l.debug('Session Token :', token)
                createCsrfToken(token)
                  .then((csrf) => {
                    l.debug('CSRF :', csrf)
                    resolve(user)
                  })
                  .catch(e => {
                    l.error('CSRF Catch :', e)
                    reject(e)
                  })
              })
              .catch(e => {
                l.error('Session Token Catch :', e)
                reject(e)
              })
          })
          .catch(err => {
            l.debug('Create Catch :', err.message)
            reject(err)
          })

      })
      .catch(e => {
        l.error(e);
        reject(new Error(e))
      })

  })





}

//---------------------------------------------------------------------------------------

function loginAndBuildResponse(credentials: any, user: IUser, res: Response) {

  attemptLogin(credentials, user)
    .then((sessionToken: string) => {
      createCsrfToken(sessionToken)
        .then(csrfToken => {
          l.debug("[USERCONTROLLER] - Login successful");
          // res.cookie("SESSIONID", sessionToken, { httpOnly: true, sameSite: 'lax', secure: true });
          // res.cookie('XSRF-TOKEN', csrfToken, { sameSite: 'lax' });
          res.cookie("SESSIONID", sessionToken, { httpOnly: true, sameSite: 'none', secure: true });
          res.cookie('XSRF-TOKEN', csrfToken, { httpOnly: true, sameSite: 'none', secure: true });
          res.header({ Authorization: `Bearer ` + csrfToken })
          res.status(200).json({
            user_id: user.user_id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            company: user.company,
            roles: user.roles
          });
        })
        .catch(err => {
          l.error(err)

        })
    })
    .catch((err) => {
      l.error(err)
      res.sendStatus(401)

    })

  // try {
  //   l.debug(user)
  //   attemptLogin(createCsrfToken,user)
  //     .then(() => {})
  //     .catch((err) => )
  //   const sessionToken = await attemptLogin(credentials, user);
  //   l.debug(sessionToken)
  //   const csrfToken = await createCsrfToken(sessionToken);
  //   l.debug(csrfToken)
  //   l.debug("[USERCONTROLLER] - Login successful");
  //   res.cookie("SESSIONID", sessionToken, { httpOnly: true, sameSite: 'Lax', secure: true });
  //   res.cookie('XSRF-TOKEN', csrfToken, { sameSite: 'Lax' });
  //   res.status(200).json({
  //     user_id: user.user_id,
  //     email: user.email,
  //     firstname: user.firstname,
  //     lastname: user.lastname,
  //     company: user.company,
  //     roles: user.roles
  //   });
  // } catch (error) {
  //   l.error("[USERCONTROLLER] - Login failed!", error);
  //   res.sendStatus(401);
  // }
}

//---------------------------------------------------------------------------------------

async function attemptLogin(credentials: any, user: IUser) {
  return new Promise((resolve, reject) => {
    l.debug('attemptLogin', user.passworddigest, credentials.password)
    argon2.verify(user.passworddigest, credentials.password)
      .then((verified) => {
        l.debug('Password match :', verified)
        if (verified) {
          l.debug('Password verified')
          resolve(createSessionToken(user))
        } else {
          //          l.error(new Error('Password Invalid'))
          reject(new Error('Password Invalid'))
        }
      })
      .catch((err) => {
        //        l.error(new Error('Error verifying token' + err))
        reject(new Error('Error verifying token' + err))
      })
  })
  // const isPasswordValid = await argon2.verify(user.passwordDigest, credentials.password);
  // if (!isPasswordValid) {
  //   throw new Error("Password Invalid");
  // }
  // return createSessionToken(user);
}

// {"firstName":"","lastName":"","email":"","password":"","company":"EXAMPLE","roles":["USER"]}
function validateCredentials(credentials) {
  var errors = '';
  //  l.debug(credentials.firstName, typeof (credentials.firstName), (credentials.firstName === ''));
  if (credentials.firstName === '') { errors = errors.concat('Firstname cannot be empty ') };
  if (credentials.lastName === '') { errors = errors.concat('LastName cannot be empty ') };
  if (credentials.email === '') { errors = errors.concat('Email Addess cannot be empty ') };
  if (credentials.password === '') { errors = errors.concat('Password cannot be empty ') };
  l.debug('[USERCONTROLLER] - [Validation : ]', errors);
  return errors;
}

export default new userController();

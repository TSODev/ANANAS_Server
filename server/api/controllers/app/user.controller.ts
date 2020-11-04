import e, { Request, Response } from 'express';
import { dbUser } from '../../services/user.service';
import argon2 from 'argon2';
import { createSessionToken, createCsrfToken } from "../../../authentication/security.utils";
import l from '../../../common/logger';
import { IUser } from '../../models/users.model';

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
    //    l.debug('[USERCONTROLLER] - Register User : ', credentials);
    const errors = validateCredentials(credentials);
    if (errors.length > 0) {
      res.status(400).json(errors);
    } else {
      createUserAndSession(res, credentials)
        .then((user) => {
          //          l.debug('[USERCONTROLLER] - User created:', user)
          res.status(200).json(user)
        })
        .catch((err) => {
          //          l.debug(JSON.parse(err.message).value["user_id"])
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
        //        l.debug(user)
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
    //    l.debug("[USERCONTROLLER] - GetContent");
    res.status(200).json({ contenu: 'ceci est un test' });
  }

  async getUser(req: Request, res: Response) {
    if (!db.dbConnected) res.sendStatus(500);
    //    l.debug("[USERCONTROLLER] - looking for current User (id): ", req["userId"]);
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
    //    l.debug("[USERCONTROLLER] - looking for userId: ", id);
    const user = await dbUser.findUserById(id);
    if (user) {
      res.status(200).json({ user: user });
    } else {
      res.sendStatus(204);
    }
  }


  async getUserByEmail(req: Request, res: Response) {

    const email = req.params['email'];
    //    l.debug("[USERCONTROLLER] - looking for user email: ", email);

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
    //    l.debug('[USERCONTROLLER] - Request for delete userId:', req.params.id);
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
        dbUser.createUser(credentials, passwordDigest)
          .then(user => {
            createSessionToken(user)
              .then(token => {
                createCsrfToken(token)
                  .then((csrf) => {
                    resolve(user)
                  })
                  .catch(e => {
                    reject(e)
                  })
              })
              .catch(e => {
                reject(e)
              })
          })
          .catch(err => {
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

}

//---------------------------------------------------------------------------------------

async function attemptLogin(credentials: any, user: IUser) {
  return new Promise((resolve, reject) => {
    argon2.verify(user.passworddigest, credentials.password)
      .then((verified) => {
        if (verified) {
          resolve(createSessionToken(user))
        } else {
          reject(new Error('Password Invalid'))
        }
      })
      .catch((err) => {
        reject(new Error('Error verifying token' + err))
      })
  })
}

function validateCredentials(credentials) {
  var errors = '';
  if (credentials.firstName === '') { errors = errors.concat('Firstname cannot be empty ') };
  if (credentials.lastName === '') { errors = errors.concat('LastName cannot be empty ') };
  if (credentials.email === '') { errors = errors.concat('Email Addess cannot be empty ') };
  if (credentials.password === '') { errors = errors.concat('Password cannot be empty ') };
  return errors;
}

export default new userController();

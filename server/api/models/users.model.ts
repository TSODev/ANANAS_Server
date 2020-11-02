

export interface IUser {
  user_id: string,
  email: string,
  domain: string,
  company: string,
  passworddigest: string,
  firstname: string,
  lastname: string,
  roles: string[],
  license: string,
  lastLogin: Date,
  createdDate: Date
}


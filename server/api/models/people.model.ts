

export interface IPeople {
    people_id: number,
    source: number,
    matricule: number,
    tgi: string,
    fullname: string,
    firstname: string,
    lastname: string,
    // HRA_absences: [string]
    // LN_absences: [string]
    posact: string,
    entree: Date,
    sortie: Date,
    createdDate: Date
}

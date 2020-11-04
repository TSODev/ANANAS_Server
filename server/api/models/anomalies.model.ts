
declare enum type_etat {
    'CREE' = 1,
    'ANALYSE' = 2,
    'CORRIGEE' = 3,
}

export interface IAnomalie {
    anomalie_id: number,
    people_id: number,
    anomalie_from: string,
    etat: number,
    hra_id: number,
    hracode: string,
    ln_id: number,
    lncode: string,
    libelle: string,
    debut: Date,
    commentaire: string,
    createddate: Date
}

export interface IAnomalie_View {
    anomalie_id: number,
    people_id: number,
    from: string,
    etat: number,
    hra_id: number,
    hracode: string,
    ln_id: number,
    lncode: string,
    message: string,
    debut: Date,
    commentaire: string,
    fullname: string,
    tgi: string
    matricule: string,
}

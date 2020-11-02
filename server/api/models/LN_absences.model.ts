

export interface ILN_Absence {
    absence_id: number,
    people_id: number,
    matricule: string,
    tgi: string,
    code: string,
    regroupement: string,
    debut: Date,
    fin: Date,
    hasanomalie: boolean,
    createdDate: Date
}

export interface ILN_Absence_View {
    code: string,
    debut: Date,
    fin: Date,
    hasanomalies: boolean,
    fullname: string,
    tgi: string
    matricule: string,
}


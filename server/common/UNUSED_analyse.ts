import { IAnomalie } from '../api/models/anomalies.model'
import { IHRA_Absence } from '../api/models/HRA_absences.model'
import { ILN_Absence } from '../api/models/LN_absences.model'
import { IPeople } from '../api/models/people.model'
import { dbAnomalies } from '../api/services/anomalies.service'
import { dbLN_Absence } from '../api/services/LN_absence.service'

import l from './logger'

const moment = require('moment')

const LNmapping = [
    { in: ':AAP', mapped: '2:AAP', color: '', rule: [] },
    { in: ':CP', mapped: 'CP', color: '', rule: [] },
    { in: ':RECUP', mapped: 'RECUP', color: '', rule: [] },
    { in: '.RECUP', mapped: 'RECUP', color: '', rule: [] },
    { in: ':RTT19', mapped: 'RTT19', color: '', rule: [] },
    { in: ':RTT20', mapped: 'RTT20', color: '', rule: [] },
    { in: ':RTTs', mapped: 'RTTs', color: '', rule: [] },
    { in: '.AANP', mapped: 'AANP', color: '', rule: [] },
    { in: '.AAP', mapped: 'AAP', color: '', rule: [] },
    { in: '.CG', mapped: 'CG', color: '', rule: [] },
    { in: '.CM', mapped: 'CM', color: '', rule: [] },
    { in: '.CP', mapped: 'CP', color: '', rule: [] },
    { in: '.CSAB', mapped: 'CSAB', color: '', rule: [] },
    { in: '.NC', mapped: 'NC', color: '', rule: [] },
    { in: '.RTTe', mapped: 'RTTe', color: '', rule: [] },
    { in: 'AAP', mapped: 'AAP', color: '', rule: [] },
    { in: 'AMS', mapped: 'AMS', color: '', rule: [] },
    { in: 'CG', mapped: 'CG', color: '', rule: [] },
    { in: 'CHO', mapped: 'CHO', color: '', rule: [] },
    { in: 'CM', mapped: 'CM', color: '', rule: [] },
    { in: 'CP', mapped: 'CP', color: '', rule: [] },
    { in: 'CPA', mapped: 'CPA', color: '', rule: [] },
    { in: '.CPANC', mapped: 'CPA', color: '', rule: [] },
    { in: 'CPE', mapped: 'CP', color: '', rule: [] },
    { in: 'CP20', mapped: 'CP', color: '', rule: [] },
    { in: 'CPrlq', mapped: 'CPrlq', color: '', rule: [] },
    { in: 'OUT', mapped: 'OUT', color: '', rule: [] },
    { in: 'PC', mapped: 'PC', color: '', rule: [] },
    { in: 'PF', mapped: 'PF', color: '', rule: [] },
    { in: 'PFT', mapped: 'PFT', color: '', rule: [] },
    { in: 'PFTC', mapped: 'PFTC', color: '', rule: [] },
    { in: 'PTE', mapped: 'PTE', color: '', rule: [] },
    { in: 'PTH', mapped: 'PTH', color: '', rule: [] },
    { in: 'RTTe', mapped: 'RTTe', color: '', rule: [] },
    { in: 'STP', mapped: 'STP', color: '', rule: [] },
    { in: 'x', mapped: 'XXX', color: '', rule: [] },
    { in: 'XXX', mapped: 'XXX', color: '', rule: [] },
    { in: 'xxx', mapped: 'XXX', color: '', rule: [] },
    { in: '#N/A', mapped: '#N/A', color: '', rule: [] },
    { in: 'WE', mapped: 'WE', color: '', rule: [] },
    { in: ' ', mapped: ' ', color: '', rule: [] },
    { in: '', mapped: ' ', color: '', rule: [] },
    { in: '0', mapped: '0', color: '', rule: [] },
]

const HRAmapping = [
    // { in: ':CP', mapped: 'CPJ', color: '-', rule: [] },
    // { in: '.CM', mapped: 'ML', color: '-', rule: [] },
    // { in: '.CP', mapped: 'CPJ', color: '-', rule: [] },
    // { in: '.CP', mapped: 'CPS', color: '-', rule: [] },
    // { in: '.CP', mapped: 'CPM', color: '-', rule: [] },
    // { in: '.RTTe', mapped: 'AJC', color: '-', rule: [] },
    // { in: 'CM', mapped: 'ML', color: '-', rule: [] },
    // { in: 'CP', mapped: 'CPJ', color: '-', rule: [] },
    // { in: 'CP', mapped: 'CPM', color: '-', rule: [] },
    // { in: 'CP', mapped: 'CPS', color: '-', rule: [] },
    // { in: 'CPE', mapped: 'CPJ', color: '-', rule: [] },
    // { in: 'CP20', mapped: 'CPJ', color: '-', rule: [] },
    // { in: 'RTTe', mapped: 'AJC', color: '-', rule: [] },
    // { in: '.CPANC', mapped: 'CAJ', color: '-', rule: [] },
    // { in: 'CPA', mapped: 'CAJ', color: '-', rule: [] },
    { in: '.CHO', mapped: 'APN', color: '-', rule: [] },
    { in: '!CHO', mapped: 'APN', color: '-', rule: [] },
    { in: '.RTTE', mapped: 'RTT', color: '-', rule: [] },
    { in: 'RTTE', mapped: 'RTT', color: '-', rule: [] },
    { in: '.RTTE', mapped: 'RTA', color: '-', rule: [] },
    { in: 'RTTE', mapped: 'RTA', color: '-', rule: [] },
]

export const JoursFeries = (an) => {
    var JourAn = new Date(an, 0, 1)
    var FeteTravail = new Date(an, 4, 1)
    var Victoire1945 = new Date(an, 4, 8)
    var FeteNationale = new Date(an, 6, 14)
    var Assomption = new Date(an, 7, 15)
    var Toussaint = new Date(an, 10, 1)
    var Armistice = new Date(an, 10, 11)
    var Noel = new Date(an, 11, 25)
    var SaintEtienne = new Date(an, 11, 26)

    var G = an % 19
    var C = Math.floor(an / 100)
    var H = (C - Math.floor(C / 4) - Math.floor((8 * C + 13) / 25) + 19 * G + 15) % 30
    var I = H - Math.floor(H / 28) * (1 - Math.floor(H / 28) * Math.floor(29 / (H + 1)) * Math.floor((21 - G) / 11))
    var J = (an * 1 + Math.floor(an / 4) + I + 2 - C + Math.floor(C / 4)) % 7
    var L = I - J
    var MoisPaques = 3 + Math.floor((L + 40) / 44)
    var JourPaques = L + 28 - 31 * Math.floor(MoisPaques / 4)
    var Paques = new Date(an, MoisPaques - 1, JourPaques)
    var VendrediSaint = new Date(an, MoisPaques - 1, JourPaques - 2)
    var LundiPaques = new Date(an, MoisPaques - 1, JourPaques + 1)
    var Ascension = new Date(an, MoisPaques - 1, JourPaques + 39)
    var Pentecote = new Date(an, MoisPaques - 1, JourPaques + 49)
    var LundiPentecote = new Date(an, MoisPaques - 1, JourPaques + 50)

    return [JourAn, VendrediSaint, Paques, LundiPaques, FeteTravail, Victoire1945, Ascension, Pentecote, LundiPentecote, FeteNationale, Assomption, Toussaint, Armistice, Noel, SaintEtienne]
}


const AllHRAmaps = (code) => {
    return HRAmapping.filter(m => m.mapped === code)
}

function checkAbsencesAtDay(people_id: number, day, code): Promise<[ILN_Absence]> {
    return new Promise((resolve, reject) => {
        dbLN_Absence.findAbsencesForPeopleId(people_id)
            .then(hasCodeInDay => resolve(hasCodeInDay))
            .catch(err => reject(err))
    })

}

function checkAnyAbsencesAtDay(people_num, day) {
    const p = this.getPeopleInfo(people_num)
    if (p !== null) {
        const hasCodeAtDay = p.absences.find(a => (a.debut <= day) && (a.fin >= day))
        return (hasCodeAtDay !== undefined)
    } else {
        return false
    }
}

const asyncSome = async (array, predicate) => {
    for (let e of array) {
        if (await predicate(e)) return true
    }
    return false
}

export const HRAanalyse = (people_id: number, code: string, start: Date, end: Date): Promise<IAnomalie> => {
    return new Promise((resolve, reject) => {
        l.debug("Analyse HRA :", people_id, code, start, end)
        const JF = JoursFeries(moment().year())

        for (var date = moment(start); date.isBefore(end); date.add(1, 'days')) {
            const day = moment(date).day()
            //            if (day !== 0 && day !== 6 && JF.some(ferie => date === ferie)) {                           // Does not check on Week End
            if (day !== 0 && day !== 6) {                           // Does not check on Week End

                const HRAmap = AllHRAmaps(code)
                l.debug('HRA code :', date.format('dddd DD MMMM YYYY'), people_id, code, HRAmap)
                // if (HRAmap !== undefined) {
                //     try {
                //         //                        const hasCodeInLN = HRAmap.some(async scode => (await checkAbsencesAtDay(people_id, date, scode.in)))
                //         asyncSome(HRAmap, checkAbsencesAtDay(people_id, date, scode.in))
                //             .then(hasCodeInLN => {
                //                 if (!hasCodeInLN)
                //                     // dbAnomalies.createAnomalie({
                //                     //     anomalie_id: null,
                //                     //     people_id: people_id,
                //                     //     code: code,
                //                     //     subcode: '',
                //                     //     libelle: 'sans LN associé',
                //                     //     debut: start,
                //                     //     fin: end,
                //                     //     createddate: new Date()
                //                     // })
                //                     //     .then(anomalie => resolve(anomalie))
                //                     //     .catch(err => reject(err))
                //             })
                //             .catch(error => l.error(error.message))
                //     }
                //     catch (error) {
                //         l.error(error.message)
                //     }
                // }
            } else {
                l.info('Week-End ou Jour Ferié ', date.format('dddd DD MMMM YYYY'), day)
            }
        }
    })

}





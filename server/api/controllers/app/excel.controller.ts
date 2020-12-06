import { Request, Response } from 'express';
import l from '../../../common/logger';

import LN_absenceController from './LN_absence.controller'


var fs = require('fs');
var moment = require('moment')
const readXlsxFile = require('read-excel-file/node');


export class excelController {


    uploadLN(req, res, next) {
        //        l.debug("excel controller : ", req.file)
        const file = req.file
        const cols = []
        const rows = []

        if (!file) {
            const error = new Error('Please upload a file')
            //            error.httpStatusCode = 400
            return next(error)
        }
        const regexp = /^"/g
        readXlsxFile(file.path).then((filerows: [[any]]) => {
            // `rows` is an array of rows
            // each row being an array of cells.
            filerows.slice(0, 1).map(columns => {
                columns.map(col => {
                    if (typeof col === 'number') {
                        cols.push(moment(new Date((col - (25567 + 2)) * 86400 * 1000)).locale('fr').format("DD/MM"))
                    } else {
                        cols.push(col)
                    }
                })
            })
            filerows.shift()                        // remove cols header
            filerows.forEach((cells) => {
                const theRow = {}
                cells.forEach((cell, index) => {
                    theRow[cols[index]] = cell
                })
                rows.push(theRow)
            });
            l.debug("XLSX cols : ", cols)
            //            l.debug("XLSX rows : ", rows)

            req.body = {
                name: file.originalname,
                props: {},
                cols: cols,
                rows: rows
            }
            fs.unlinkSync(file.path);
            //            res.send(file)
            next()
        })



    }

    uploadHRA(req, res, next) {
        //        l.debug("excel controller : ", req.file)
        const file = req.file
        if (!file) {
            const error = new Error('Please upload a file')
            //            error.httpStatusCode = 400
            return next(error)
        }
        res.send(file)
    }
}


export default new excelController();
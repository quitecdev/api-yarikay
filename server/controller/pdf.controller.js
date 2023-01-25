const moment = require('moment');
const currencyFormatter = require('currency-formatter');

const ObjectId = require('mongodb').ObjectID;

const FileModel = require('../models/file.model');
const SaleModel = require('../models/sale.model');
const PrefactureModel = require('../models/prefacture.model');
const WorkShopModel = require('../models/workshop.model');


const PhoneService = require('../controller/phone.controller');

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs;


let pdfExample = (req, res) => {

    let id = req.params.id;

    let query = [
        { $match: { _id: new ObjectId(id) } },
    ];

    SaleModel.aggregate(query).exec((err, prefactureResp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (prefactureResp) {
            let sale = prefactureResp[0];

            let document = sale.document;
            let client = sale.client;
            let details = sale.details;
            let due = sale.due;

            let stillUtc = moment.utc(sale.date).toDate();
            let date = moment(stillUtc).local().format('YYYY-MM-DD HH:mm');

            let column = [];
            column.push({ text: 'Cod.', style: 'tableHeader', fontSize: 10 });
            column.push({ text: 'Descripción', style: 'tableHeader', fontSize: 10 });
            column.push({ text: 'Cant.', style: 'tableHeader', fontSize: 10 });
            column.push({ text: 'V. Unitario', style: 'tableHeader', fontSize: 10 });
            column.push({ text: 'Total', style: 'tableHeader', fontSize: 10 });

            let tableDetails = [];
            tableDetails.push(column);

            details.forEach(product => {
                let cod = product.cod;
                let name = product.name;
                let quantity = product.quantity;
                let unitary = product.unitary;
                let subotal = product.subotal;
                let detail = [];
                detail.push({ text: `${cod}`, fontSize: 9 });
                detail.push({ text: `${name}`, fontSize: 9 });
                detail.push({ text: `${quantity}`, fontSize: 9, alignment: 'right' });
                detail.push({ text: `${currencyFormatter.format(unitary, { code: 'USD',precision: 3 })}`, fontSize: 9, alignment: 'right' });
                detail.push({ text: `${currencyFormatter.format(subotal, { code: 'USD',precision: 3 })}`, fontSize: 9, alignment: 'right' });

                tableDetails.push(detail);
            });

            var docDefinition = {
                pageSize: 'A5',
                pageMargins: [20, 20, 20, 20],
                content: [{
                        columns: [
                            [{
                                    image: 'data:image/png;base64,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',
                                    width: 80,
                                },
                                {
                                    text: [
                                        { text: 'Dirección Matriz:', fontSize: 8, bold: true },
                                        { text: `ISLA SANTA FE N43-168 y AV. RIO COCA`, fontSize: 8 },

                                    ],
                                },
                                {
                                    text: [
                                        { text: 'Dirección:', fontSize: 8, bold: true },
                                        { text: `INTEROCEANICA SN y AV. SIMON BOLIVAR`, fontSize: 8 },

                                    ],
                                }
                            ],
                            [{
                                    text: [
                                        { text: 'Nº Factura: ', style: 'numberDocument', },
                                        { text: `${document}`, style: 'numberDocument' },

                                    ],
                                },
                                {
                                    text: [
                                        { text: 'R.U.C.:', style: 'fontbold9' },
                                        { text: `1711826790001`, style: 'font9' },

                                    ],
                                },
                                { text: 'FERNANDEZ ORMAZA JUAN CARLOS', fontSize: 10, bold: true },

                                {
                                    text: [
                                        { text: 'Número Autorización:', style: 'fontbold9' },

                                    ],
                                },
                                {
                                    text: [
                                        { text: `${sale.accessCode}`, fontSize: 7 },

                                    ],
                                },
                                { text: 'CONTRIBUYENTE RÉGIMEN RIMPE', fontSize: 9, bold: true },
                                { text: 'OBLIGADO A LLEVAR CONTABILIDAD SI', fontSize: 9, bold: true },
                            ]
                        ],
                        margin: [0, 0, 0, 15],

                    },
                    {
                        text: [
                            { text: 'Fecha :', bold: true, margin: [0, 20] },
                            ` ${date} \n\n`,
                            { text: 'CI/RUC :', bold: true, margin: [0, 20] },
                            ` ${client.dni} \n\n`,
                            { text: 'Nombre :', bold: true, margin: [0, 20] },
                            ` ${client.name} \n\n`,
                            { text: 'Teléfono :', bold: true, margin: [0, 20] },
                            ` ${client.phone} \n\n`,
                            { text: 'Dirección :', bold: true, margin: [0, 20] },
                            ` ${client.address} \n`,
                        ],
                        style: 'header'
                    },
                    {
                        style: 'tableDetails',
                        table: {
                            headerRows: 1,
                            widths: [50, 120, 25, 60, 60],
                            body: tableDetails,
                            alignment: "center"
                        },
                        layout: 'lightHorizontalLines'
                    },
                    {
                        style: 'tableDue',
                        table: {
                            headerRows: 1,
                            widths: [50, 120, 25, 60, 60],
                            body: [
                                ['', '', '', '', ''],
                                [
                                    { text: '' },
                                    { text: '' },
                                    { text: '' },
                                    { text: `Subtotal`, alignment: 'right', fontSize: 9 },
                                    { text: `${currencyFormatter.format(due.subTotal, { code: 'USD',precision: 2 })}`, alignment: 'right', fontSize: 9 },
                                ],
                                [
                                    { text: '' },
                                    { text: '' },
                                    { text: '' },
                                    { text: `Iva 12%`, alignment: 'right', fontSize: 9 },
                                    { text: `${currencyFormatter.format(due.tax, { code: 'USD',precision: 2 })}`, alignment: 'right', fontSize: 9 },
                                ],
                                [
                                    { text: '' },
                                    { text: '' },
                                    { text: '' },
                                    { text: `Total`, alignment: 'right', bold: true, fontSize: 9 },
                                    { text: `${currencyFormatter.format(due.total, { code: 'USD',precision: 2 })}`, alignment: 'right', bold: true, fontSize: 9 },
                                ],
                            ],
                            alignment: "center"
                        },
                        layout: 'headerLineOnly'
                    },
                    {
                        text: [
                            { text: 'Observación: ', fontSize: 9, bold: true },
                            { text: `${sale.observations}`, fontSize: 9 },

                        ],
                        absolutePosition: { x: 20, y: 450 }
                    },
                ],
                footer: {
                    columns: [

                        {
                            alignment: 'right',
                            text: `${document}`,
                            fontSize: 8,
                        }
                    ],
                    margin: [20, 0]
                },
                styles: {
                    header: {
                        fontSize: 9,
                        lineHeight: 0.7,
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 9,
                        color: 'black'
                    },
                    tableDetails: {
                        margin: [0, 10, 0, 0],
                        fontSize: 9,
                    },
                    tableDue: {
                        margin: [0, 0, 0, 5],
                        fontSize: 9,
                    },
                    numberDocument: {
                        fontSize: 11,
                        bold: true,
                        margin: [0, 50],
                    },
                    fontbold9: {
                        fontSize: 9,
                        bold: true,
                    },
                    font9: {
                        fontSize: 9,
                    }


                }
            };


            const pdfDocGenerator = pdfMake.createPdf(docDefinition);
            pdfDocGenerator.getBase64((data) => {

                var pdf = Buffer.from(data, 'base64');
                res.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-Length': pdf.length
                });
                res.end(pdf);
            });
        } else {
            return res.status(400).json({
                ok: false,
                err: 'No se ha encontrado registros'
            });
        }

    });
}

let pdfInvoice = (req, sale, filename) => {

    let document = sale.document;
    let client = sale.client;
    let details = sale.details;
    let due = sale.due;
    let payment = sale.payment;

    let stillUtc = moment.utc(sale.date).toDate();
    let date = moment(stillUtc).local().format('YYYY-MM-DD HH:mm');

    let column = [];
    column.push({ text: 'Cod.', style: 'tableHeader', fontSize: 10 });
    column.push({ text: 'Descripción', style: 'tableHeader', fontSize: 10 });
    column.push({ text: 'Cant.', style: 'tableHeader', fontSize: 10 });
    column.push({ text: 'V. Unitario', style: 'tableHeader', fontSize: 10 });
    column.push({ text: 'Total', style: 'tableHeader', fontSize: 10 });

    let tableDetails = [];
    tableDetails.push(column);

    details.forEach(product => {
        let cod = product.cod;
        let name = product.name;
        let quantity = product.quantity;
        let unitary = product.unitary;
        let subotal = product.subotal;
        let detail = [];
        detail.push({ text: `${cod}`, fontSize: 10 });
        detail.push({ text: `${name}`, fontSize: 10 });
        detail.push({ text: `${quantity}`, fontSize: 10, alignment: 'right' });
        detail.push({ text: `${currencyFormatter.format(unitary, { code: 'USD',precision: 3 })}`, fontSize: 10, alignment: 'right' });
        detail.push({ text: `${currencyFormatter.format(subotal, { code: 'USD',precision: 3 })}`, fontSize: 10, alignment: 'right' });

        tableDetails.push(detail);
    });

    var docDefinition = {
        pageSize: 'A5',
        pageMargins: [20, 20, 20, 20],
        content: [{
                columns: [
                    [{
                            image: 'data:image/png;base64,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',
                            width: 80,
                        },
                        {
                            text: [
                                { text: 'Dirección Matriz:', fontSize: 8, bold: true },
                                { text: `ISLA SANTA FE N43-168 y AV. RIO COCA`, fontSize: 8 },

                            ],
                        },
                        {
                            text: [
                                { text: 'Dirección:', fontSize: 8, bold: true },
                                { text: `INTEROCEANICA SN y AV. SIMON BOLIVAR`, fontSize: 8 },

                            ],
                        }
                    ],
                    [{
                            text: [
                                { text: 'Nº Factura: ', style: 'numberDocument', },
                                { text: `${document}`, style: 'numberDocument' },

                            ],
                        },
                        {
                            text: [
                                { text: 'R.U.C.:', style: 'fontbold9' },
                                { text: `1711826790001`, style: 'font9' },

                            ],
                        },
                        { text: 'FERNANDEZ ORMAZA JUAN CARLOS', fontSize: 10, bold: true },

                        {
                            text: [
                                { text: 'Número Autorización:', style: 'fontbold9' },

                            ],
                        },
                        {
                            text: [
                                { text: `${sale.accessCode}`, fontSize: 7 },

                            ],
                        },
                        { text: 'CONTRIBUYENTE RÉGIMEN RIMPE', fontSize: 9, bold: true },
                        { text: 'OBLIGADO A LLEVAR CONTABILIDAD SI', fontSize: 9, bold: true },
                    ]
                ],
                margin: [0, 0, 0, 15],

            },
            {
                text: [
                    { text: 'Fecha :', bold: true, margin: [0, 20] },
                    ` ${date} \n\n`,
                    { text: 'CI/RUC :', bold: true, margin: [0, 20] },
                    ` ${client.dni} \n\n`,
                    { text: 'Nombre :', bold: true, margin: [0, 20] },
                    ` ${client.name} \n\n`,
                    { text: 'Teléfono :', bold: true, margin: [0, 20] },
                    ` ${client.phone} \n\n`,
                    { text: 'Dirección :', bold: true, margin: [0, 20] },
                    ` ${client.address} \n`,
                ],
                style: 'header'
            },
            {
                style: 'tableDetails',
                table: {
                    headerRows: 1,
                    widths: [50, 120, 25, 60, 60],
                    body: tableDetails,
                    alignment: "center"
                },
                layout: 'lightHorizontalLines'
            },
            {
                style: 'tableDue',
                table: {
                    headerRows: 1,
                    widths: [50, 120, 25, 60, 60],
                    body: [
                        ['', '', '', '', ''],
                        [
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: `Subtotal`, alignment: 'right', fontSize: 9 },
                            { text: `${currencyFormatter.format(due.subTotal, { code: 'USD',precision: 2 })}`, alignment: 'right', fontSize: 9 },
                        ],
                        [
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: `Iva 12%`, alignment: 'right', fontSize: 9 },
                            { text: `${currencyFormatter.format(due.tax, { code: 'USD',precision: 2 })}`, alignment: 'right', fontSize: 9 },
                        ],
                        [
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: `Total`, alignment: 'right', bold: true, fontSize: 9 },
                            { text: `${currencyFormatter.format(due.total, { code: 'USD',precision: 2 })}`, alignment: 'right', bold: true, fontSize: 9 },
                        ],
                    ],
                    alignment: "center"
                },
                layout: 'headerLineOnly'
            },
            {
                text: [
                    { text: 'Observación: ', fontSize: 9, bold: true },
                    { text: `${sale.observations}`, fontSize: 9 },

                ],
                absolutePosition: { x: 20, y: 450 }
            },
        ],
        footer: {
            columns: [

                {
                    alignment: 'right',
                    text: `${document}`,
                    fontSize: 8,
                }
            ],
            margin: [20, 0]
        },
        styles: {
            header: {
                fontSize: 9,
                lineHeight: 0.7,
            },
            tableHeader: {
                bold: true,
                fontSize: 9,
                color: 'black'
            },
            tableDetails: {
                margin: [0, 10, 0, 0],
                fontSize: 9,
            },
            tableDue: {
                margin: [0, 0, 0, 5],
                fontSize: 9,
            },
            numberDocument: {
                fontSize: 11,
                bold: true,
                margin: [0, 50],
            },
            fontbold9: {
                fontSize: 9,
                bold: true,
            },
            font9: {
                fontSize: 9,
            }


        }
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBase64((data) => {
        let file = FileModel({
            filename: filename,
            metadata: data,
            contentType: 'application/pdf',
            size: data.length
        });

        file.save();
    });
}

let pdfNote = (req, sale, filename) => {

    let document = sale.document;
    let client = sale.client;
    let details = sale.details;
    let due = sale.due;
    let payment = sale.payment;

    let qrCode = `${req.protocol}://${req.get('host')}/file/document/${filename}`;

    let stillUtc = moment.utc(sale.date).toDate();
    let date = moment(stillUtc).local().format('YYYY-MM-DD HH:mm');

    let column = [];
    column.push({ text: 'Cod.', style: 'tableHeader' });
    column.push({ text: 'Descripción', style: 'tableHeader' });
    column.push({ text: 'Cant.', style: 'tableHeader' });
    column.push({ text: 'V. Unitario', style: 'tableHeader' });
    column.push({ text: 'Total', style: 'tableHeader' });

    let tableDetails = [];
    tableDetails.push(column);

    details.forEach(product => {

        let cod = product.cod;
        let name = product.name;
        let quantity = product.quantity;
        let unitary = product.unitary;
        let subotal = product.subotal;

        let detail = [];
        detail.push({ text: `${cod}` });
        detail.push({ text: `${name}` });
        detail.push({ text: `${quantity}`, alignment: 'right' });
        detail.push({ text: `${currencyFormatter.format(unitary, { code: 'USD',precision: 3 })}`, alignment: 'right' });
        detail.push({ text: `${currencyFormatter.format(subotal, { code: 'USD',precision: 3 })}`, alignment: 'right' });
        tableDetails.push(detail);
    });

    var docDefinition = {
        pageSize: 'A4',
        pageMargins: [35, 35, 35, 35],
        content: [{
                columns: [{
                        image: 'data:image/png;base64,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',
                        width: 104,
                        height: 38,
                    },
                    {
                        text: [
                            { text: 'Nº Nota de Venta: ', style: 'note' },
                            { text: `${document}`, style: 'note' },

                        ],
                    }
                ],
                margin: [0, 10, 0, 25],
            },
            {
                text: [
                    { text: 'Fecha :', bold: true, margin: [0, 20], },
                    ` ${date} \n\n`,
                    { text: 'CI/RUC :', bold: true, margin: [0, 20], },
                    ` ${client.dni} \n\n`,
                    { text: 'Nombre :', bold: true, margin: [0, 20], },
                    ` ${client.name} \n\n`,
                    { text: 'Teléfono :', bold: true, margin: [0, 20], },
                    ` ${client.phone} \n\n`,
                    { text: 'Dirección :', bold: true, margin: [0, 20], },
                    ` ${client.address} \n`,
                ],
                style: 'header'
            },
            // { "qr": `${qrCode}`, fit: 50, margin: [0, 10, 0, 10], },
            {
                style: 'tableDetails',
                table: {
                    headerRows: 1,
                    widths: [80, 220, 25, 40, 40],
                    body: tableDetails,
                    alignment: "center"
                },
                layout: 'lightHorizontalLines'
            },
            {
                style: 'tableDue',
                table: {
                    headerRows: 1,
                    widths: [80, 220, 25, 40, 40],
                    body: [
                        ['', '', '', '', ''],
                        [
                            { text: 'Efectivo:', fontSize: 10 },
                            { text: `${currencyFormatter.format(payment.cash, { code: 'USD',precision: 2 })}`, fontSize: 10 },

                            { text: '' },
                            { text: `Subtotal`, alignment: 'right' },
                            { text: `${currencyFormatter.format(due.subTotal, { code: 'USD',precision: 2 })}`, alignment: 'right' },
                        ],
                        [
                            { text: 'Dinero Electrónico:', fontSize: 10 },
                            { text: `${currencyFormatter.format(payment.electronic, { code: 'USD',precision: 2 })}`, fontSize: 10 },
                            { text: '' },
                            { text: `Iva 0%`, alignment: 'right' },
                            { text: `${currencyFormatter.format(due.tax, { code: 'USD',precision: 2 })}`, alignment: 'right' },
                        ],
                        [
                            { text: 'Tarjeta Débito/Crédito', fontSize: 10 },
                            { text: `${currencyFormatter.format(payment.card, { code: 'USD',precision: 2 })}`, fontSize: 10 },
                            { text: '' },
                            { text: `Total`, alignment: 'right', bold: true },
                            { text: `${currencyFormatter.format(due.total, { code: 'USD',precision: 2 })}`, alignment: 'right', bold: true },
                        ],
                    ],
                    alignment: "center"
                },
                layout: 'headerLineOnly'
            },
        ],
        footer: {
            columns: [

                {
                    alignment: 'right',
                    text: `${document}`,
                    fontSize: 5,
                }
            ],
            margin: [10, 0]
        },
        styles: {
            header: {
                fontSize: 8,

            },
            note: {
                fontSize: 10,
                color: 'red',
                alignment: 'right',
                bold: true,
            },
            tableHeader: {
                bold: true,
                fontSize: 10,
                color: 'black'
            },
            tableDetails: {
                margin: [0, 10, 0, 0],
                fontSize: 10,
            },
            tableDue: {
                margin: [0, 0, 0, 5],
                fontSize: 10,
            },
        }
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBase64((data) => {
        let file = FileModel({
            filename: filename,
            metadata: data,
            contentType: 'application/pdf',
            size: data.length
        });

        file.save();
    });
}

let pdfPurchase = (req, purchase, filename) => {
    let document = purchase.document;
    let provider = purchase.provider;
    let transaction = purchase.transaction;
    let details = purchase.details;
    let due = purchase.due;
    let payment = purchase.payment;

    let qrCode = `${req.protocol}://${req.get('host')}/file/document/${filename}`;

    let stillUtc = moment.utc(purchase.date).toDate();
    let date = moment(stillUtc).local().format('YYYY-MM-DD HH:mm');

    let column = [];
    column.push({ text: 'Cod.', style: 'tableHeader' });
    column.push({ text: 'Descripción', style: 'tableHeader' });
    column.push({ text: 'Cant.', style: 'tableHeader' });
    column.push({ text: 'V. Unitario', style: 'tableHeader' });
    column.push({ text: 'Total', style: 'tableHeader' });

    let tableDetails = [];
    tableDetails.push(column);

    details.forEach(product => {
        let cod = product.cod;
        let name = product.name;
        let quantity = product.quantity;
        let unitary = product.unitary;
        let subotal = product.subotal;
        let detail = [];
        detail.push({ text: `${cod}` });
        detail.push({ text: `${name}` });
        detail.push({ text: `${quantity}`, alignment: 'right' });
        detail.push({ text: `${currencyFormatter.format(unitary, { code: 'USD',precision: 3 })}`, alignment: 'right' });
        detail.push({ text: `${currencyFormatter.format(subotal, { code: 'USD',precision: 3 })}`, alignment: 'right' });

        tableDetails.push(detail);
    });

    var docDefinition = {
        pageSize: 'A4',
        pageMargins: [35, 35, 35, 35],
        content: [{
                columns: [{
                        image: 'data:image/png;base64,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',
                        width: 104,
                        height: 38,
                    },
                    {
                        text: [
                            { text: 'Nº Compra: ', style: 'note' },
                            { text: `${document}`, style: 'note' },

                        ],
                    }
                ],
                margin: [0, 10, 0, 25],
            },
            {
                text: [
                    { text: 'Fecha :', bold: true, margin: [0, 15], },
                    ` ${date} \n\n`,
                    { text: 'Nº Documento :', bold: true, margin: [0, 15], },
                    ` ${transaction.document} \n\n`,
                    { text: 'CI/RUC :', bold: true, margin: [0, 15], },
                    ` ${provider.dni} \n\n`,
                    { text: 'Nombre :', bold: true, margin: [0, 15], },
                    ` ${provider.name} \n\n`,
                    { text: 'Dirección :', bold: true, margin: [0, 15], },
                    ` ${provider.address} \n`,
                ],
                style: 'header'
            },
            // { "qr": `${qrCode}`, fit: 50, margin: [0, 10, 0, 10], },
            {
                style: 'tableDetails',
                table: {
                    headerRows: 1,
                    widths: [80, 220, 25, 40, 40],
                    body: tableDetails,
                    alignment: "center"
                },
                layout: 'lightHorizontalLines'
            },
            {
                style: 'tableDue',
                table: {
                    headerRows: 1,
                    widths: [80, 220, 25, 40, 40],
                    body: [
                        ['', '', '', '', ''],
                        [
                            { text: 'Efectivo:', fontSize: 10 },
                            { text: `${currencyFormatter.format(payment.cash, { code: 'USD',precision: 2 })}`, fontSize: 10 },

                            { text: '' },
                            { text: `Subtotal`, alignment: 'right' },
                            { text: `${currencyFormatter.format(due.subTotal, { code: 'USD',precision: 2 })}`, alignment: 'right' },
                        ],
                        [
                            { text: 'Dinero Electrónico:', fontSize: 10 },
                            { text: `${currencyFormatter.format(payment.electronic, { code: 'USD',precision: 2 })}`, fontSize: 10 },
                            { text: '' },
                            { text: `Iva 0%`, alignment: 'right' },
                            { text: `${currencyFormatter.format(due.tax, { code: 'USD',precision: 2 })}`, alignment: 'right' },
                        ],
                        [
                            { text: 'Tarjeta Débito/Crédito', fontSize: 10 },
                            { text: `${currencyFormatter.format(payment.card, { code: 'USD',precision: 2 })}`, fontSize: 10 },
                            { text: '' },
                            { text: `Total`, alignment: 'right', bold: true },
                            { text: `${currencyFormatter.format(due.total, { code: 'USD',precision: 2 })}`, alignment: 'right', bold: true },
                        ],
                    ],
                    alignment: "center"
                },
                layout: 'headerLineOnly'
            },
        ],
        footer: {
            columns: [

                {
                    alignment: 'right',
                    text: `${document}`,
                    fontSize: 10,
                }
            ],
            margin: [10, 0]
        },
        styles: {
            header: {
                fontSize: 10,

            },
            note: {
                fontSize: 10,
                color: 'red',
                alignment: 'right',
                bold: true,
            },
            tableHeader: {
                bold: true,
                fontSize: 10,
                color: 'black'
            },
            tableDetails: {
                margin: [0, 10, 0, 0],
                fontSize: 10,
            },
            tableDue: {
                margin: [0, 0, 0, 5],
                fontSize: 10,
            },
        }
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBase64((data) => {
        let file = FileModel({
            filename: filename,
            metadata: data,
            contentType: 'application/pdf',
            size: data.length
        });

        file.save();
    });

}

let pdfTransfer = (req, transfer, filename) => {

    let document = transfer.document;
    let branch = transfer.selectBranch;
    let destination = transfer.selectDestination;
    let details = transfer.details;

    let qrCode = `${req.protocol}://${req.get('host')}/file/document/${filename}`;

    let stillUtc = moment.utc(transfer.date).toDate();
    let date = moment(stillUtc).local().format('YYYY-MM-DD HH:mm');

    let column = [];
    column.push({ text: 'Cod.', style: 'tableHeader' });
    column.push({ text: 'Descripción', style: 'tableHeader' });
    column.push({ text: 'Stock', style: 'tableHeader' });
    column.push({ text: 'Cant.', style: 'tableHeader' });

    let tableDetails = [];
    tableDetails.push(column);

    details.forEach(product => {

        let cod = product.cod;
        let name = product.name;
        let stock = product.product.existence;
        let quantity = product.quantity;

        let detail = [];
        detail.push({ text: `${cod}` });
        detail.push({ text: `${name}` });
        detail.push({ text: `${stock}`, alignment: 'center' });
        detail.push({ text: `${quantity}`, alignment: 'center' });

        tableDetails.push(detail);
    });

    var docDefinition = {
        pageSize: 'A4',
        pageMargins: [35, 35, 35, 35],
        content: [{
                columns: [{
                        image: 'data:image/png;base64,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',
                        width: 104,
                        height: 38,
                    },
                    {
                        text: [
                            { text: 'Nº Transferencia: ', style: 'note' },
                            { text: `${document}`, style: 'note' },

                        ],
                    }
                ],
                margin: [0, 10, 0, 25],
            },
            {
                text: [
                    { text: 'Fecha :', bold: true, margin: [0, 15], },
                    ` ${date} \n\n`,
                    { text: 'Bodega Origen :', bold: true, margin: [0, 15], },
                    ` ${branch.name} \n\n`,
                    { text: 'Bodega Destino :', bold: true, margin: [0, 15], },
                    ` ${destination.name} \n\n`,
                ],
                style: 'header'
            },
            { "qr": `${qrCode}`, fit: 50, margin: [0, 10, 0, 10], },
            {
                style: 'tableDetails',
                table: {
                    headerRows: 1,
                    widths: [80, 220, 25, 40, 40],
                    body: tableDetails,
                    alignment: "center"
                },
                layout: 'lightHorizontalLines'
            },
        ],
        footer: {
            columns: [

                {
                    alignment: 'right',
                    text: `${document}`,
                    fontSize: 10,
                }
            ],
            margin: [10, 0]
        },
        styles: {
            header: {
                fontSize: 10,

            },
            note: {
                fontSize: 10,
                color: 'red',
                alignment: 'right',
                bold: true,
            },
            tableHeader: {
                bold: true,
                fontSize: 10,
                color: 'black'
            },
            tableDetails: {
                margin: [0, 10, 0, 0],
                fontSize: 10,
            },
            tableDue: {
                margin: [0, 0, 0, 5],
                fontSize: 10,
            },
        }
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBase64((data) => {
        let file = FileModel({
            filename: filename,
            metadata: data,
            contentType: 'application/pdf',
            size: data.length
        });

        file.save();
    });

}

let pdfCredit = (req, sale, filename) => {

    let document = sale.document;
    let client = sale.client;
    let details = sale.details;
    let due = sale.due;
    let payment = sale.payment;

    let qrCode = `${req.protocol}://${req.get('host')}/file/document/${filename}`;

    let stillUtc = moment.utc(sale.date).toDate();
    let date = moment(stillUtc).local().format('YYYY-MM-DD HH:mm');

    let column = [];
    column.push({ text: 'Cod.', style: 'tableHeader' });
    column.push({ text: 'Descripción', style: 'tableHeader' });
    column.push({ text: 'Cant.', style: 'tableHeader' });
    column.push({ text: 'V. Unitario', style: 'tableHeader' });
    column.push({ text: 'Total', style: 'tableHeader' });

    let tableDetails = [];
    tableDetails.push(column);

    details.forEach(product => {

        let cod = product.cod;
        let name = product.name;
        let quantity = product.quantity;
        let unitary = product.unitary;
        let subotal = product.subotal;

        let detail = [];
        detail.push({ text: `${cod}` });
        detail.push({ text: `${name}` });
        detail.push({ text: `${quantity}`, alignment: 'right' });
        detail.push({ text: `${currencyFormatter.format(unitary, { code: 'USD',precision: 3 })}`, alignment: 'right' });
        detail.push({ text: `${currencyFormatter.format(subotal, { code: 'USD',precision: 3 })}`, alignment: 'right' });
        tableDetails.push(detail);
    });

    var docDefinition = {
        pageSize: 'A5',
        pageMargins: [20, 20, 20, 20],
        content: [{
                columns: [{
                        image: 'data:image/png;base64,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',
                        width: 20,
                        height: 15,
                    },
                    {
                        text: [
                            { text: 'Nº Nota de Crédito: ', style: 'note' },
                            { text: `${document}`, style: 'note' },

                        ],
                    }
                ],
                margin: [0, 10, 0, 25],
            },
            {
                text: [
                    { text: 'Fecha :', bold: true, margin: [0, 20], },
                    ` ${date} \n\n`,
                    { text: 'CI/RUC :', bold: true, margin: [0, 20], },
                    ` ${client.dni} \n\n`,
                    { text: 'Nombre :', bold: true, margin: [0, 20], },
                    ` ${client.name} \n\n`,
                    { text: 'Teléfono :', bold: true, margin: [0, 20], },
                    ` ${client.phone} \n\n`,
                    { text: 'Dirección :', bold: true, margin: [0, 20], },
                    ` ${client.address} \n`,
                ],
                style: 'header'
            },
            { "qr": `${qrCode}`, fit: 50, margin: [0, 10, 0, 10], },
            {
                style: 'tableDetails',
                table: {
                    headerRows: 1,
                    widths: [50, 150, 25, 40, 40],
                    body: tableDetails,
                    alignment: "center"
                },
                layout: 'lightHorizontalLines'
            },
            {
                style: 'tableDue',
                table: {
                    headerRows: 1,
                    widths: [50, 150, 25, 40, 40],
                    body: [
                        ['', '', '', '', ''],
                        [
                            { text: 'Efectivo:', fontSize: 10 },
                            { text: `${currencyFormatter.format(payment.cash, { code: 'USD',precision: 2 })}`, fontSize: 10 },

                            { text: '' },
                            { text: `Subtotal`, alignment: 'right' },
                            { text: `${currencyFormatter.format(due.subTotal, { code: 'USD',precision: 2 })}`, alignment: 'right' },
                        ],
                        [
                            { text: 'Dinero Electrónico:', fontSize: 10 },
                            { text: `${currencyFormatter.format(payment.electronic, { code: 'USD',precision: 2 })}`, fontSize: 10 },
                            { text: '' },
                            { text: `Iva 0%`, alignment: 'right' },
                            { text: `${currencyFormatter.format(due.tax, { code: 'USD',precision: 2 })}`, alignment: 'right' },
                        ],
                        [
                            { text: 'Tarjeta Débito/Crédito', fontSize: 10 },
                            { text: `${currencyFormatter.format(payment.card, { code: 'USD',precision: 2 })}`, fontSize: 10 },
                            { text: '' },
                            { text: `Total`, alignment: 'right', bold: true },
                            { text: `${currencyFormatter.format(due.total, { code: 'USD',precision: 2 })}`, alignment: 'right', bold: true },
                        ],
                    ],
                    alignment: "center"
                },
                layout: 'headerLineOnly'
            },
        ],
        footer: {
            columns: [

                {
                    alignment: 'right',
                    text: `${document}`,
                    fontSize: 5,
                }
            ],
            margin: [10, 0]
        },
        styles: {
            header: {
                fontSize: 8,

            },
            note: {
                fontSize: 9,
                color: 'red',
                alignment: 'right',
                bold: true,
            },
            tableHeader: {
                bold: true,
                fontSize: 7,
                color: 'black'
            },
            tableDetails: {
                margin: [0, 10, 0, 0],
                fontSize: 7,
            },
            tableDue: {
                margin: [0, 0, 0, 5],
                fontSize: 8,
            },
        }
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBase64((data) => {
        let file = FileModel({
            filename: filename,
            metadata: data,
            contentType: 'application/pdf',
            size: data.length
        });

        file.save();
    });
}

let pdfWorkShop = (req, res) => {

    let id = req.params.id;
    let filename = req.params.filename;

    let query = [
        { $match: { _id: new ObjectId(id) } },
        {
            $lookup: {
                from: 'vehicles',
                localField: 'vehicle',
                foreignField: '_id',
                as: 'vehicle'
            }
        },
        { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'clients',
                localField: 'vehicle.client',
                foreignField: 'dni',
                as: 'client'
            }
        },
        { $unwind: '$client' },
        {
            $project: {
                _id: "$_id",
                document: "$document",
                date: "$date",
                client: "$client.name",
                dni: "$client.dni",
                address: "$client.address",
                phone: "$client.phone",
                licenceplate: "$vehicle.licenceplate",
                mark: "$vehicle.mark",
                model: "$vehicle.model",
                year: "$vehicle.year",
                color: "$vehicle.color",
                mileage: "$mileage",
                work: "$work",
                bodywork: "$bodywork"
            }
        }
    ];

    WorkShopModel.aggregate(query).exec((err, workshopResp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        let workshop = workshopResp[0];

        let stillUtc = moment.utc(workshop.date).toDate();
        let date = moment(stillUtc).local().format('YYYY-MM-DD HH:mm');

        var docDefinition = {
            pageSize: 'A4',
            pageMargins: [35, 35, 35, 35],
            content: [{
                    columns: [{
                            image: 'data:image/png;base64,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',
                            width: 104,
                            height: 38,
                        },
                        {
                            text: [
                                { text: 'Nº Orden de Trabajo: ', style: 'note' },
                                { text: `${workshop.document}`, style: 'note' },

                            ],
                        }
                    ],
                    margin: [0, 10, 0, 25],
                },
                {
                    columns: [{
                            width: '70%',
                            text: [
                                { text: 'Fecha :', bold: true, margin: [0, 20], },
                                ` ${date} \n\n`,
                                { text: 'CI/RUC :', bold: true, margin: [0, 20], },
                                ` ${workshop.dni} \n\n`,
                                { text: 'Nombre :', bold: true, margin: [0, 20], },
                                ` ${workshop.client} \n\n`,
                                { text: 'Teléfono :', bold: true, margin: [0, 20], },
                                ` ${workshop.phone} \n\n`,
                                { text: 'Dirección :', bold: true, margin: [0, 20], },
                                ` ${workshop.address} \n`,
                            ],
                            style: 'header'
                        },
                        {
                            width: '30%',
                            text: [
                                { text: 'Placa :', bold: true, margin: [0, 20], },
                                ` ${workshop.licenceplate} \n\n`,
                                { text: 'Narca :', bold: true, margin: [0, 20], },
                                ` ${workshop.mark} \n\n`,
                                { text: 'Modelo :', bold: true, margin: [0, 20], },
                                ` ${workshop.model} \n\n`,
                                { text: 'Año :', bold: true, margin: [0, 20], },
                                ` ${workshop.year} \n\n`,
                                { text: 'Color :', bold: true, margin: [0, 20], },
                                ` ${workshop.color} \n\n`,
                                { text: 'KM :', bold: true, margin: [0, 20], },
                                ` ${workshop.mileage} \n`,
                            ],
                            style: 'header'
                        }
                    ],
                },
                {
                    margin: [0, 20, 0, 15],
                    table: {
                        widths: ['*'],
                        body: [
                            [{ text: "Al suscribir la presente orden de trabajo el cliente autoriza la motorización del vehículo, prueba de ruta y demás pruebas pertinentes que debe realizarse para la verificación del correcto funcionamiento del mismo.\n PASADO 10 DÍAS DE HABER NOTIFICADO EL VEHÍCULO SE COBRARÁ BODEGAJE", style: 'filledHeader' }]

                        ]
                    },

                },
                {
                    margin: [0, 5],
                    table: {
                        headerRows: 1,
                        widths: ['*'],
                        body: [
                            [
                                { text: "TRABAJO A REALIZAR :", style: 'workTable' }
                            ],
                        ]
                    }
                },
                {
                    margin: [0, 5],
                    table: {
                        heights: 100,
                        widths: ['*'],
                        body: [
                            [
                                { text: workshop.work, style: 'workDetail' }
                            ],
                        ]
                    },
                    layout: 'lightHorizontalLines'
                },
                {
                    margin: [0, 5],
                    table: {
                        headerRows: 1,
                        widths: ['*'],
                        body: [
                            [
                                { text: "CARROCERÍA :", style: 'workTable' }
                            ],
                        ]
                    }
                },
                {
                    margin: [5, 5],
                    columns: [{

                            image: 'data:image/jpeg;base64,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',
                            width: 300,
                        },
                        {
                            margin: [40, 5],
                            ul: [{
                                    text: [
                                        { text: 'Plumas :', bold: true, margin: [0, 20], },
                                        ` ${workshop.bodywork.pens ? 'Si' : 'No'}`,
                                    ]
                                },
                                {
                                    text: [
                                        { text: 'Radio :', bold: true, margin: [0, 20], },
                                        ` ${workshop.bodywork.radio ? 'Si' : 'No'}`,
                                    ]
                                },
                                {
                                    text: [
                                        { text: 'Perillas :', bold: true, margin: [0, 20], },
                                        ` ${workshop.bodywork.knobs ? 'Si' : 'No'}`,
                                    ]
                                },
                                {
                                    text: [
                                        { text: 'Encendedor :', bold: true, margin: [0, 20], },
                                        ` ${workshop.bodywork.lighter ? 'Si' : 'No'}`,
                                    ]
                                },
                                {
                                    text: [
                                        { text: 'Matricula :', bold: true, margin: [0, 20], },
                                        ` ${workshop.bodywork.enrollment ? 'Si' : 'No'}`,
                                    ]
                                },
                                {
                                    text: [
                                        { text: 'Antena :', bold: true, margin: [0, 20], },
                                        ` ${workshop.bodywork.antenna ? 'Si' : 'No'}`,
                                    ]
                                },
                                {
                                    text: [
                                        { text: 'Tacacubos :', bold: true, margin: [0, 20], },
                                        ` ${workshop.bodywork.hubcaps ? 'Si' : 'No'}`,
                                    ]
                                },
                                {
                                    text: [
                                        { text: 'Herramientas :', bold: true, margin: [0, 20], },
                                        ` ${workshop.bodywork.tools ? 'Si' : 'No'}`,
                                    ]
                                },
                                {
                                    text: [
                                        { text: 'Gato :', bold: true, margin: [0, 20], },
                                        ` ${workshop.bodywork.cat ? 'Si' : 'No'}`,
                                    ]
                                },
                                {
                                    text: [
                                        { text: 'Espejos :', bold: true, margin: [0, 20], },
                                        ` ${workshop.bodywork.mirrors ? 'Si' : 'No'}`,
                                    ]
                                },
                                {
                                    text: [
                                        { text: 'Tuerca de seguridad :', bold: true, margin: [0, 20], },
                                        ` ${workshop.bodywork.emergencyTire ? 'Si' : 'No'}`,
                                    ]
                                },
                                {
                                    text: [
                                        { text: 'Gasolina :', bold: true, margin: [0, 20], },
                                        ` ${workshop.bodywork.gasoline} %`,
                                    ]
                                },
                            ]
                        }
                    ]
                },
                {
                    margin: [0, 5],
                    text: [
                        { text: 'Novedades :', bold: true, margin: [0, 20], },
                        ` ${workshop.bodywork.news} \n\n`,
                    ],
                },
                {
                    absolutePosition: { x: 120, y: 760 },
                    columns: [
                        [
                            { canvas: [{ type: 'line', x1: 130, y1: 0, x2: 0, y2: 0, lineWidth: 0.7 }] },
                            { text: 'Firma Cliente ', margin: [25, 5] },
                        ],
                        [
                            { canvas: [{ type: 'line', x1: 130, y1: 0, x2: 0, y2: 0, lineWidth: 0.7 }] },
                            { text: 'Firma Recepcionista ', margin: [25, 5] },
                        ]

                    ]
                },
            ],
            footer: {
                columns: [

                    {
                        alignment: 'right',
                        text: `${workshop.document}`,
                        fontSize: 7,
                    }
                ],
                margin: [35, 0]
            },
            defaultStyle: {
                fontSize: 10,
            },
            styles: {
                header: {
                    fontSize: 10,
                    lineHeight: 0.8,
                },
                note: {
                    fontSize: 15,
                    color: 'red',
                    alignment: 'right',
                    bold: true,
                },
                tableHeader: {
                    bold: true,
                    fontSize: 10,
                    color: 'black'
                },
                tableDetails: {
                    margin: [0, 10, 0, 0],
                    fontSize: 10,
                },
                tableDue: {
                    margin: [0, 0, 0, 5],
                    fontSize: 10,
                },
                filledHeader: {
                    margin: [0, 10],
                    bold: true,
                    fontSize: 10,
                    color: 'white',
                    fillColor: '#1F1C1C',
                    alignment: 'center'
                },
                workTable: {
                    margin: [0, 5],
                    bold: true,
                    fontSize: 10,
                    color: 'white',
                    fillColor: '#1F1C1C',
                    alignment: 'center'
                },
                workDetail: {
                    fontSize: 10,
                    margin: [0, 5],
                }
            }
        };

        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBase64((data) => {
            let file = FileModel({
                filename: filename,
                metadata: data,
                contentType: 'application/pdf',
                size: data.length
            });

            file.save((err, file) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    file
                });
            });
        });
    });
}

let pdfPrefacture = (req, res) => {

    let id = req.params.id;
    let filename = req.params.filename;

    let query = [
        { $match: { _id: new ObjectId(id) } },
    ];

    PrefactureModel.aggregate(query).exec((err, prefactureResp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        let sale = prefactureResp[0];

        let document = sale.document;
        let client = sale.client;
        let details = sale.details;
        let due = sale.due;

        let stillUtc = moment.utc(sale.date).toDate();
        let date = moment(stillUtc).local().format('YYYY-MM-DD HH:mm');

        let column = [];
        column.push({ text: 'Cod.', style: 'tableHeader', fontSize: 10 });
        column.push({ text: 'Descripción', style: 'tableHeader', fontSize: 10 });
        column.push({ text: 'Cant.', style: 'tableHeader', fontSize: 10 });
        column.push({ text: 'V. Unitario', style: 'tableHeader', fontSize: 10 });
        column.push({ text: 'Total', style: 'tableHeader', fontSize: 10 });

        let tableDetails = [];
        tableDetails.push(column);

        details.forEach(product => {
            let cod = product.cod;
            let name = product.name;
            let quantity = product.quantity;
            let unitary = product.unitary;
            let subotal = product.subotal;
            let detail = [];
            detail.push({ text: `${cod}`, fontSize: 10 });
            detail.push({ text: `${name}`, fontSize: 10 });
            detail.push({ text: `${quantity}`, fontSize: 10, alignment: 'right' });
            detail.push({ text: `${currencyFormatter.format(unitary, { code: 'USD',precision: 3 })}`, fontSize: 10, alignment: 'right' });
            detail.push({ text: `${currencyFormatter.format(subotal, { code: 'USD',precision: 3 })}`, fontSize: 10, alignment: 'right' });

            tableDetails.push(detail);
        });

        var docDefinition = {
            pageSize: 'A4',
            pageMargins: [35, 35, 35, 35],
            content: [{
                    columns: [{
                            image: 'data:image/png;base64,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',
                            width: 104,
                            height: 38,
                        },
                        {
                            text: [
                                { text: 'Nº Prefactura: ', style: 'note' },
                                { text: `${document}`, style: 'note' },

                            ],
                        }
                    ],
                    margin: [0, 10, 0, 25],
                },
                {
                    text: [
                        { text: 'Fecha :', bold: true, margin: [0, 20] },
                        ` ${date} \n\n`,
                        { text: 'CI/RUC :', bold: true, margin: [0, 20] },
                        ` ${client.dni} \n\n`,
                        { text: 'Nombre :', bold: true, margin: [0, 20] },
                        ` ${client.name} \n\n`,
                        { text: 'Teléfono :', bold: true, margin: [0, 20] },
                        ` ${client.phone} \n\n`,
                        { text: 'Dirección :', bold: true, margin: [0, 20] },
                        ` ${client.address} \n`,
                    ],
                    style: 'header'
                },
                {
                    style: 'tableDetails',
                    table: {
                        headerRows: 1,
                        widths: [80, 220, 25, 60, 60],
                        body: tableDetails,
                        alignment: "center"
                    },
                    layout: 'lightHorizontalLines'
                },
                {
                    style: 'tableDue',
                    table: {
                        headerRows: 1,
                        widths: [80, 220, 25, 60, 60],
                        body: [
                            ['', '', '', '', ''],
                            [
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: `Subtotal`, alignment: 'right', fontSize: 10 },
                                { text: `${currencyFormatter.format(due.subTotal, { code: 'USD',precision: 2 })}`, alignment: 'right', fontSize: 10 },
                            ],
                            [
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: `Iva 12%`, alignment: 'right', fontSize: 10 },
                                { text: `${currencyFormatter.format(due.tax, { code: 'USD',precision: 2 })}`, alignment: 'right', fontSize: 10 },
                            ],
                            [
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: `Total`, alignment: 'right', bold: true, fontSize: 10 },
                                { text: `${currencyFormatter.format(due.total, { code: 'USD',precision: 2 })}`, alignment: 'right', bold: true, fontSize: 10 },
                            ],
                        ],
                        alignment: "center"
                    },
                    layout: 'headerLineOnly'
                },
                {
                    absolutePosition: { x: 120, y: 760 },
                    columns: [
                        [
                            { canvas: [{ type: 'line', x1: 130, y1: 0, x2: 0, y2: 0, lineWidth: 0.7 }] },
                            { text: 'Firma Autorizada ', margin: [25, 5] },
                        ],
                        [
                            { canvas: [{ type: 'line', x1: 130, y1: 0, x2: 0, y2: 0, lineWidth: 0.7 }] },
                            { text: 'Firma Cliente ', margin: [25, 5] },
                        ]

                    ]
                },
            ],
            footer: {
                columns: [

                    {
                        alignment: 'right',
                        text: `${document}`,
                        fontSize: 8,
                    }
                ],
                margin: [20, 0]
            },
            styles: {
                header: {
                    fontSize: 10,
                    lineHeight: 0.7,
                },
                tableHeader: {
                    bold: true,
                    fontSize: 10,
                    color: 'black'
                },
                tableDetails: {
                    margin: [0, 10, 0, 0],
                    fontSize: 10,
                },
                tableDue: {
                    margin: [0, 0, 0, 5],
                    fontSize: 10,
                },
                note: {
                    fontSize: 15,
                    color: 'red',
                    alignment: 'right',
                    bold: true,
                },

            }
        };


        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBase64((data) => {
            let file = FileModel({
                filename: filename,
                metadata: data,
                contentType: 'application/pdf',
                size: data.length
            });

            file.save((err, file) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    file
                });
            });
        });

    });

}

module.exports = {
    pdfPrefacture,
    pdfPurchase,
    pdfWorkShop,
    pdfTransfer,
    pdfInvoice,
    pdfExample,
    pdfCredit,
    pdfNote,
}
const SaleModel = require('../models/sale.model');
const Request = require("request");


let getAllInvoices = (req, res) => {

    try {

        SaleModel.find().exec((err, sales) => {
            sales.forEach(sale => {
                Request.get(`https://apifactq.quitec.com.ec/api/Invoice/accesscode/${sale.accessCode}`, (error, response, body) => {
                    if (error) {
                        return res.status(400).json({
                            ok: false,
                            error
                        });
                    }

                    console.log(body);
                    // console.dir(JSON.parse(body));

                    // res.json({
                    //     sale: JSON.parse(body)
                    // });
                });
            });

            res.json({
                ok: true
            });
        });



    } catch (error) {
        console.log(error);
    }


    // Request.get("https://apifactq.quitec.com.ec/api/Invoice/accesscode/0104202301171182679000120040010000037293827293917", (error, response, body) => {
    //     if (error) {
    //         return res.status(400).json({
    //             ok: false,
    //             error
    //         });
    //     }
    //     // console.dir(JSON.parse(body));

    //     res.json({
    //         sale: JSON.parse(body)
    //     });
    // });

}

module.exports = {
    getAllInvoices
}
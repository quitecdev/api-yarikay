const moment = require('moment-timezone');
const { ObjectId } = require('mongodb');
const OrderModel = require('../models/order.model');

let getDate = (req, res) => {

    res.json({
        ok: true,
        date: new Date(),
        moment: moment.tz(Date.now(), "America/Guayaquil").format()
    });
}

let getForDay = (req, res) => {

    let branch = req.params.branch;

    const dateStart = moment.tz(Date.now(), "America/Guayaquil");
    const dateEnd = moment.tz(Date.now(), "America/Guayaquil");

    var start = moment(dateStart).utc(true).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format();
    var end = moment(dateEnd).utc(true).set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format();

    let query = [{
            $addFields: {
                date: { $dateToString: { date: "$date", timezone: "America/Guayaquil" } }
            }
        },
        { $match: { branch: ObjectId(branch), date: { $gte: start, $lt: end } } },

        { $sort: { state: 1 } }
    ];

    OrderModel.aggregate(query).exec((err, orders) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            start,
            end,
            orders
        });
    });
}


module.exports = {
    getDate,
    getForDay
}
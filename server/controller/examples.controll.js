const moment = require('moment-timezone');

let getDate = (req, res) => {

    res.json({
        ok: true,
        date: new Date(),
        moment: moment.tz(Date.now(), "America/Guayaquil").format()
    });
}

module.exports = {
    getDate
}
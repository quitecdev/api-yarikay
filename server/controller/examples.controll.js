const moment = require('moment-timezone');


let getDate = (req, res) => {

    res.json({
        ok: true,
        date: moment().tz("America/New_York").format(),
        start: moment().tz("America/New_York").set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format(),
        end: moment.tz(Date.now(), "America/Guayaquil").format(),
    });
}

module.exports = {
    getDate
}
const jwt = require('jsonwebtoken');

//=============================
// Verificar Token
//=============================

let checkToken = (req, res, next) => {
    let token = req.headers['token'];
    jwt.verify(token, process.env.SEDD, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.user = decoded.user;
        next();
    });
};


module.exports = {
    checkToken
};
const jwt = require('jsonwebtoken');
/**
 * @function hasAuth ensures the user supplied a valid JWT token and decodes it. stores it in the request, and routes to the next middleware or endpoint.
 * @param {*} req request from previous middleware or endpoint.
 * @param {*} res request from previous middleware or endpoint.
 * @param {*} next next middleware or endpoint to route to.
 */
 const hasAuth = async (req, res, next) => {
    var header = req.headers['authorization'];
    if(typeof header === 'undefined'){
        res.sendStatus(401);
    }
    else{
        var token = header.split(' ');
        token = token[1];
        jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
            if(err) {
                res.sendStatus(403);
            }
            else{
                req.token = token;
                req.jwt = decoded;
                next();
            }
        });
    }
}

module.exports = {hasAuth}
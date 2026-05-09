const express = require('express')
// const app = express()
// const port = 3000

const requestTimeStampLogger = (req, res, next) => {
    const timeStamp = new Date().toISOString();

    console.log(`${timeStamp} from ${req.method} for ${req.url}`);

    next()
}

module.exports = { requestTimeStampLogger }
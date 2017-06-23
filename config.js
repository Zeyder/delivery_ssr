const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'local'
const isInProduction = env.trim() == 'production'

const
    fs = require('fs'),
    config = {
        dev: {
            host: 'localhost',
            port: 4000
        },
        prod: {
            host: 'proxy.deliveryninja.ru',
            port: 4000
        }
    },
    host = isInProduction ? config.prod.host : config.dev.host,
    port = isInProduction ? config.prod.port : config.dev.port,
    options = {
        key: fs.readFileSync('ssl/privkey1.pem'),
        cert: fs.readFileSync('ssl/fullchain1.pem'),
        requestCert: false
    }

module.exports = {host, port, options};

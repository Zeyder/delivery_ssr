const
    app = require('express')(),
    https = require('https'),
    host = require('./config').host,
    port = require('./config').port,
    options = require('./config').options,
    RenderController = require('./controllers/RenderController');

app.get('/render/*', (req, res) => new RenderController(req, res).action());

https.createServer(options, app).listen(port, host, () => console.log(`Server succefully started at ${host}:${port}`));

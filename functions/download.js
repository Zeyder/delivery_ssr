const
    fs = require('fs'),
    axios = require('axios');

/*
* Return Promise 
* file <String> path_to_save <String> 
*/
const download = function(path, path_to_save){
    let axios_instance = axios.create({
        headers: {
            'User-Agent': "Vue-Server-Prerenderer/" + require('vue-server-renderer/package.json').version
        },
        validateStatus(status) {
            return status == 200;
        }
    })
    return new Promise(function(resolve, reject){
        axios_instance.get(path).then( response => {
            let data = '';
            switch(response.headers["content-type"]){
                case 'application/json': data = JSON.stringify(response.data); break;
                default: data = response.data;
            }
            fs.writeFileSync(path_to_save, data);
            resolve(true);
        }).catch(error => {
            console.log(`[Download func] Error! Is impossible download ${path} file`);
            console.error(error);
            reject(`[Download func] Error! Is impossible download ${path} file`);
        });
    });
}

module.exports = download;
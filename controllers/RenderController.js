const 
    Controller = require('./Controller'),
    download = require('../functions/download'),
    Render = require('../functions/Render'),
    url = require('url'),
    fs = require('fs'),
    isURL = require('is-url'),
    vue_ssr_bundle_json = 'vue-ssr-bundle.json',
    index_server_html = 'index.server.html';
    cache_dir = './cache';

class RenderController extends Controller {
    constructor(req, res){
        super(req, res);

        try{
            if (!fs.existsSync(cache_dir)){
                fs.mkdirSync(cache_dir);
            }
        }catch(error){
            console.error(error);
            console.log(`[RootController] Error! impossible to create '${cache_dir}' folder`)
            cache_dir = '.';
        }

        cache_dir += '/';
    }
    //Проверяем на валидность параметры запроса
    _isValidRequestParams(){
        let exp = new RegExp('(?:(?:http|https?)?://|www\.)[a-z_.]+?[a-z_]{2,6}(:?/[a-z0-9\-?\[\]=&;#]+)?', 'g');
        return isURL(this.parserURL().href) && this.parserURL().href.indexOf(`${this.host}:${this.port}`) == -1;
    }
    parserURL(){
        return url.parse(super.parserURL().pathname.replace('render/', ''));
    }

    action(){
        super.action();
        var contentSended = false,
            rendererIstance = null,
            bundleFile = null,
            templateFile = null,
            timeStartRender = Date.now(),
            path_to_filename = '',
            paramsReq = this.parserURL(),
            site_folder = null;
        
        if (this._isValidRequestParams()){

            site_folder = cache_dir + paramsReq.hostname;
            path_to_filename = site_folder + '/' + url.parse(paramsReq.href).path.split('/').join('_') + '.html';
            bundleFile = `${site_folder}/${vue_ssr_bundle_json}`;
            templateFile = `${site_folder}/${index_server_html}`;
                    
            if (fs.existsSync(site_folder)){
                if (fs.existsSync(bundleFile) && fs.existsSync(templateFile)){
                    rendererIstance = new Render(fs.readFileSync(bundleFile, 'utf-8'), fs.readFileSync(templateFile, 'utf-8'));
                    if (fs.existsSync(path_to_filename)){
                        this.putContent(fs.readFileSync(path_to_filename, 'utf-8'));
                        contentSended = true;
                    }else{
                        rendererIstance.render(paramsReq.path).then(html => {
                            fs.writeFileSync(path_to_filename, html);
                            this.putContent(html);
                            contentSended = true;
                        }).catch(err => this.sendError(500, err) );
                    }
                }
            }else {
                fs.mkdirSync(site_folder);
                bundleFile = `${site_folder}/${vue_ssr_bundle_json}`;
                templateFile = `${site_folder}/${index_server_html}`;
            }

            
            Promise.all([
                download(`${paramsReq.protocol}//${paramsReq.host}/dist/${vue_ssr_bundle_json}`, bundleFile),
                download(`${paramsReq.protocol}//${paramsReq.host}/dist/${index_server_html}`, templateFile)
            ])
            .then(result => {
                if (result[0] && result[1]){
                    let bundle_code = fs.readFileSync(bundleFile, 'utf-8');
                    let template_code = fs.readFileSync(templateFile, 'utf-8');
                    try{
                        JSON.parse(bundle_code);
                        rendererIstance = new Render(bundle_code, template_code);
                        rendererIstance.render(paramsReq.path).then(html => {
                            fs.writeFileSync(path_to_filename, html);
                            if (!this.contentSended){
                                this.putContent(html);
                                contentSended = true;
                            }
                        }).catch(err => this.sendError(500, err) );
                    }catch(error) {
                        console.error(error);
                        console.log(`[RenderController] Error! File vue-ssr-bundle.json or index.server.html is empty or invalid! RequestURL: ${paramsReq.href}`)
                    }
                }
            }).catch(err => this.sendError(404, err) );
        

        }else{
            this.sendError(400, `Error! URL is invalid`);
        }
    }
}

module.exports = RenderController;
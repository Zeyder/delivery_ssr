const 
    renderer = require('vue-server-renderer'),
    cache = require('lru-cache');

class Render {
    constructor(bundle, template){
        let cacheOptions = {
            max: this.cacheMax,
            maxAge: this.cacheMaxAge
        }
        this.content_marker = '<!--APP-->';
        this.header_marker = '<!--HEAD-->';
        this.cacheMax = 1000;
        this.cacheMaxAge = 1000 * 60 * 15;
        this.html = '';
        this.template = template; 
        this.instance = renderer.createBundleRenderer(JSON.parse(bundle), {cache: cache(cacheOptions)});
    }

    //Парсим документ на вставку разметки
    parseIndex(){
        const i = this.template.indexOf(this.content_marker);
        return {
            head: this.template.slice(0, i),
            tail: this.template.slice(i + this.content_marker.length)
        }
    }

    render(url){
        return new Promise((resolve, reject) => {
            let startTime = Date.now();
            let context = {url}
            let stream = this.instance.renderToStream(context);
            this.html = '';
            stream.once('data', () => {
                try {
                    let str = `<meta property="og:title" content="${context.state.head.title}"><meta property="og:description" content="${context.state.head.description}"><meta property="og:image" content="${context.state.head.img}"><meta name="description" content="${context.state.head.description}"><title>${context.state.head.title}</title><link rel="image_src" href="${context.state.head.img}">`;
                    this.html = this.parseIndex().head.replace(this.header_marker, str);
                    
                }catch(e){
                    reject(e.message);
                }
            });
            stream.on('data', chunk => this.html += chunk );
            stream.on('error', err => reject("Error! During Render was be error. Render is failed") );
            stream.on('end', () => {
                let states = '';
                if (context.state) {
                    states = `<script>window.__INITIAL_STATE__=${JSON.stringify(context.state)}</script>`;
                    this.html += states;
                }
                this.html += this.parseIndex().tail;
                console.log(`Render time: ${Date.now() - startTime}ms`);
                resolve(this.html);
            });
        });
    }
}

module.exports = Render;
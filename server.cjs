/* =========== 配置 ============ */
const config = {
    // 运行端口
    // 端口被占用时会自动寻找下一个端口
    port: 4100,
    // 自动打开浏览器
    openBrowser: false,
    // 是否开启文件压缩 
    compress: false,
};

/* =========== 以下内容无需更改 ============ */
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { exec } = require('child_process');

const { port, openBrowser } = config;

const mapContentType = {
    htm: 'text/html',
    html: 'text/html',
    mjs: 'text/javascript',
    js: 'text/javascript',
    css: 'text/css',
    map: 'application/json',
    json: 'application/json',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    mp3: 'audio/mp3',
    m4a: 'audio/mp4',
    mp4a: 'audio/mp4',
    wav: 'audio/wav',
    weba: 'audio/webm',
    ogg: 'audio/ogg',
    pdf: 'application/pdf',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    xml: 'application/xml',
    tar: 'application/x-tar',
    sh: 'application/x-sh',
    zip: 'application/zip'
};

const sendFile = (req, res) => new Promise(resolve => {
    const pathname = req.url.match(/[\/\w\-\.%!_:\(\)]+/)?.[0] || '';
    // 文件后缀
    const suffix = pathname.match(/\.(\w+)$/)?.[1];
    // 文件路径
    // 后缀为 undefined 时说明 pathname 类似 /aaa/bbb，应读取 index.html
    const filePath = decodeURIComponent(
        path.join(__dirname, suffix ? pathname : 'index.html')
    );
    // Content-Type
    const type = mapContentType[suffix] || 'text/html';

    fs.stat(filePath, (err, stat) => {
        // 文件读取错误
        if (err) {
            res.statusCode = 404;
            res.end();
            resolve(false);
            return;
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", type);
        res.setHeader("Content-Length", stat.size);
        const encoding = req.headers["accept-encoding"];
        const enableEncode = config.compress && encoding && type.indexOf("image") === -1;
        const readStream = fs.createReadStream(filePath);
        if (enableEncode && encoding.includes('gzip')) {  // gzip
            res.setHeader("Content-Encoding", 'gzip');
            const compress = zlib.createGzip();
            readStream.pipe(compress).pipe(res);
        } else if (enableEncode && encoding.includes('deflate')) {  // deflate
            res.setHeader("Content-Encoding", 'deflate');
            const compress = zlib.createDeflate();
            readStream.pipe(compress).pipe(res);
        } else {  // 不压缩
            readStream.pipe(res);
        }

        resolve(true);
    });
});

const server = http.createServer((req, res) => {
    const { url } = req;
    sendFile(req, res).then(result => {
        result && console.log(`[Server OK]: ${url}`);
        !result && console.log(`[Server ERR]: ${url}`);
    });
});

// 查看端口是否可用
const isPortUseable = (p) => {
    return new Promise(resolve => {
        const s = http.createServer().listen(p);
        // 端口可用
        s.on('listening', () => {
            s.close();
            resolve(true);
        });
        // 端口不可用
        s.on('error', () => {
            resolve(false);
        });
    });
}

const listen = async () => {
    // 在 port ~ port + 10 中寻找可用的端口进行监听
    for (let p = port; p <= port + 10; ++p) {
        const isUseable = await isPortUseable(p);
        if (isUseable) {
            server.listen(p, (err) => {
                err && console.log(err);
                !err && console.log(`server runing on port: ${p}`);
                !err && openBrowser && exec(`start http://localhost:${p}`);
            });
            return;
        }
    }

    console.error(`Err: Port ${port} ~ ${port + 10} are disabled!`);
}

listen();
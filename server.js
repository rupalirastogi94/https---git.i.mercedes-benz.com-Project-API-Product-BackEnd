import express from 'express';
import { join } from 'path';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Serve static files from the "public" directory
app.use(express.static(join(process.cwd(), 'public')));

app.use(cors());

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// Define the proxy middleware for SOAP requests
// app.use(
//     '/proxy',
//     createProxyMiddleware({
//         target: 'http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso', // Replace with the actual target URL of your SOAP API
//         changeOrigin: true,
//         pathRewrite: {
//             '^/proxy/': '',
//         },
//     })
// );
app.use('/proxy', createProxyMiddleware({
  target: 'http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso',
  changeOrigin: true,
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Content-Type'] = 'text/xml';
  },
  pathRewrite: {
                '^/proxy/': '',
            },
}));

// Handle GET requests to the root URL
app.get('/', function(req, res, next) {
    res.sendFile(join(process.cwd(), 'public', 'index.html'));
});

app.post('/', function(req, res, next) {
    console.dir(req.body, { depth: null });
    res.send('a');
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

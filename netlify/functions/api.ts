import express, { Request } from "express";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import cors from 'cors';
import serverless from 'serverless-http';
import xhub from 'express-x-hub';

dotenv.config();

const token = process.env.TOKEN || 'token';
const received_updates: Request[] = [];

const app = express();

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'));

app.use(cors());
app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    console.log(req);
    res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

const router = express.Router();
router.get('/instagram', (req, res) => {
    if (req.query['hub.mode'] == 'subscribe' && req.query['hub.verify_token'] == token) {
        res.send(req.query['hub.challenge']);
    } else {
        res.sendStatus(400);
    }
});
router.post('/instagram', function(req, res) {
    console.log('Instagram request body:');
    console.log(req.body);
    received_updates.unshift(req.body);
    res.sendStatus(200);
});

app.use('/api/', router);
export const handler = serverless(app);

// app.listen(() => {
//     console.log("Connected to port: ", app.get('port'));
// });

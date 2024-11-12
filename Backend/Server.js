require ('dotenv') .config ();

const express = require ('express');
const app = express (); 
const cookieParser = require ('cookie-parser');
const port = process.env.PORT || 4000;
const cors = require ('cors');

app.use (cors (
    {
        origin: 'http://localhost:4000',
        credentials: true,
    }
));

app.use (cookieParser ());
app.use(express.json());
app.use(express.static('public'));


const api = require ('./routes/api');
app.use ('/api', api);

const oauth = require ('./routes/Oauth');
app.use ('/oauth', oauth);

    app.listen (port, () => {
        console.log (`Server is running on port ${[port]}`);
        });

    

    
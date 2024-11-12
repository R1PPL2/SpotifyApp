const express = require('express');
const querystring = require('querystring');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const router = express.Router();

const app = express();
app.use(cookieParser());


const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URI = process.env.FRONTEND_URI || `http://localhost:3000`;


const generateRandomString = (length) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
    return text;
    };

app.get ('/login', (req, res) => {
    const state = generateRandomString (16);
    res.cookie ('spotify_auth_state', state);
    
    const scope = 'user-read-private user-read-email';
    res.redirect (`https://accounts.spotify.com/authorize?${querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        state: state,
        scope: scope,
        })}`);
    });

app.get('/callback', async (req, res) => { 
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;

    if (state === null || state !== storedState) {
        res.redirect(FRONTEND_URI + '?error=state_mismatch');
        return;
    }
    res.clearCookie('spotify_auth_state');

    try {const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        }),
        {
            headers: {
                Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );
    const { access_token, refresh_token } = response.data;
    res.redirect(`${FRONTEND_URI}?${querystring.stringify({ access_token, refresh_token })}`);
    } catch (error) {
        res.redirect(FRONTEND_URI+ '?error=invalid_token')
        }
    });

    app.get ('/refresh_token', async (req, res) => {
        const { refresh_token } = req.query;

        try {
            const response = await axios.post(
                'https://accounts.spotify.com/api/token',
                querystring.stringify({
                    grant_type: 'refresh_token',
                    refresh_token: refresh_token,
                }),
                {
                    headers: {
                        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );        
            const { access_token } = response.data;
            res.send({ access_token });
        } catch (error) {
            res.status(400).send(error);
        }
    });

module.exports = router;
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const dns = require('dns');
const url = require('url');



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
// Middleware to parse URL-encoded bodies -  which is the default for HTML forms
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const pf = '[api/shorturl] ';
  
  const original_url = req.body.url;

  verifyURL(original_url, (isValid) => {
    if(isValid){
      const short_url = generateChecksum(original_url.toLowerCase().trim());

      if(!storage.hasOwnProperty(short_url)){
        storage[short_url] = original_url;
        console.log(pf + ' added new url pair: '+short_url+' : '+original_url);
      }

      res.json({
        original_url: original_url,
        short_url: short_url
      });
    } else {
      res.json({
        error: 'invalid url'
      });
    }
  });
});

app.get('/api/shorturl/:short_url', function(req, res){
  let short_url = req.params.short_url;
  if(!storage.hasOwnProperty(short_url)){
    res.json({
      error: 'invalid url'
    });
  }else{
    res.redirect(storage[short_url]);
  }
});

let storage = {};

function generateChecksum(url) {
  return crypto.createHash('md5').update(url).digest('hex').substring(0, 5);
}

function verifyURL(submittedURL, callback) {
  try{
    const hostname = new url.URL(submittedURL).hostname;
    
    dns.lookup(hostname, (err, address, family) => {
        if (err) {
            callback(false); // URL is not valid
        } else {
            callback(true); // URL is valid
        }
    });
  } catch (error) {
    callback(false); //URL is not valid
  }
}


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

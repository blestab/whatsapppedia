var express = require('express');
var app = express();
var request = require('request');
const bodyParser = require('body-parser');


const accountSid = process.env.SID;
const authToken = process.env.KEY;
const appName = process.env.APP || 'WhatsAppedia';


const client = require('twilio')(process.env.SID, process.env.KEY);
const { MessagingResponse } = require('twilio').twiml;

const showHelp = function(userRequest) {
  const helpRequests = ['hi','hello','test','help'];
  return helpRequests.includes(userRequest);
}

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/incoming', (req, res) => {
  const twiml = new MessagingResponse();
  let message;

  if(showHelp(req.body.Body.toLowerCase().trim())){

    message = new MessagingResponse().message(
      `*Hey 👋*

I am a bot which searches the internet on your behalf and summarizes the results, to help you find relevant information, right within WhatsApp, using only your WhatsApp data bundles.

Try it out - text me anything you want me to help you search for `);

    res.set('Content-Type', 'text/xml');
    res.send(message.toString()).status(200);

  } else {

  request('https://api.duckduckgo.com/?skip_disambig=1&format=json&pretty=1&q='+req.body.Body, function (error, response, body) {
    body = JSON.parse(body)

    const msgHeading = (body["Heading"])?body["Heading"]:'Results Not Found';
    const msgBody = (body["Abstract"])?body["Abstract"]:'I am sorry i could not find information about "' +req.body.Body+'"';
    message = new MessagingResponse().message(`*`+msgHeading+`*

      `+msgBody);
    if (body["Image"]) {
      message.media(body["Image"]);
    }

    res.set('Content-Type', 'text/xml');
    res.send(message.toString()).status(200);
    });

  }

});

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});


var listener = app.listen(process.env.PORT, function() {
  console.log(appName + ' is listening on port ' + listener.address().port);
});

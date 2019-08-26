'use strict';

// Imports dependencies and set up http server
const	express = require('express'),
		bodyParser = require('body-parser'),
		app = express().use(bodyParser.json());
const request = require('request');
const {exec} = require('child_process');
const PAGE_ACCESS_TOKEN = "EAAUJbaCorfQBAD6My2Hbwj7x6vUvjll8EUtlOLWFkP0Qzs69zqI0mrofUVbICdGFodn3gGZAZBahdIwwcZArV5x4wtK6FD8P8mRc8oKZAoYt7WrgRDHILxG05UKfaOw03XBGtFRHEgY5ET1raoBpl3CxlxERvCY35ewa2bwUaAZDZD";

app.use(bodyParser.urlencoded({ extended: false }));



app.get('/webhook/', (req, res) => {

  let VERIFY_TOKEN = "translate-bot";

  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {

      res.sendStatus(403);      
    }
  }
});


app.post('/webhook/', (req, res) => {  


  let body = req.body;

  if (body.object === 'page') {

	body.entry.forEach(function(entry) {

  let webhook_event = entry.messaging[0];
  console.log(webhook_event);

  let sender_psid = webhook_event.sender.id;
  console.log('Sender PSID: ' + sender_psid);

  if (webhook_event.message) {
  
    handleMessage(sender_psid, webhook_event.message);
      
  } else if (webhook_event.postback) {

    handlePostback(sender_psid, webhook_event.postback);
  }
});
    res.status(200).send('EVENT_RECEIVED');

  } else {

    res.sendStatus(404);
  }

});

async function handleMessage(sender_psid, received_message) {
  let response;
  let output;
  if (received_message.text) {   
   
		const search_text = received_message.text;
		exec('echo \''+search_text+'\' | /home/thaesue/smt_se/mosesdecoder/bin/moses -f /home/thaesue/smt_se/Data/model8/my-en/tuning/moses.ini.1',(err,stdout,stderr) =>{
		if(err){
		console.log('exec error:'+err);
		return;
		}
		output = stdout;
		
		});
		response={ "text": output};
		
	
  
  } else if (received_message.attachments) {

    let attachment_url = received_message.attachments[0].payload.url;
 console.log(attachment_url);
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  } ;
  
    let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  };
  
  callSendAPI(request_body);   
}

function handlePostback(sender_psid, received_postback) {
  let response;
  

  let payload = received_postback.payload;

  if (payload === 'yes') {
    response = { "text": "Thanks!" };
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." };
  } else if (payload === 'Message') {
    response = { "text": "မင်္ဂလာပါ" };
  }
  
    let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  };
  
  callSendAPI(request_body);
}

function callSendAPI(request_body) {


  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}



app.listen( 1337 , () => console.log('webhook is listening 1337'));

'use strict';

// Imports dependencies and set up http server
const	express = require('express'),
		bodyParser = require('body-parser'),
		app = express().use(bodyParser.json());
const	request = require('request');
var	sys = require('sys');
const	spawn = require('child_process').execSync;
var	fs = require('fs');
const	PAGE_ACCESS_TOKEN = "EAAUJbaCorfQBACoHlUiM8XaZAHXAp2uiE6IGStImlldDQ7GJZBgviPZBz3iFTTQ46OBpXD0tQD3ZCSqqsirQmQSoNdPMOOs1k109dvrFZAb77x8hEnZCnXXJm5S3VaNGxJU5ZBcyMUcAGpUX8OtJJZCPHoMziFrjrwp9IfGsaiEnrgZDZD";

app.use(bodyParser.urlencoded({ extended: false }));



app.get('/webhook', (req, res) => {

	let VERIFY_TOKEN = "chatbot";

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


app.post('/webhook', (req, res) => {  

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
	let contents;
	let segoutput;
	if (received_message.text) {   
 
		const search_text = received_message.text;
		const pattern_test = RegExp('[က-အ]+','g');
		console.log("\n")
		console.log("\n")
	   console.log(search_text);
	   const x = pattern_test.test(search_text);
	   
	   if(x){
			console.log("Myanmar Sentence is received");
			const seg = spawn("echo \""+search_text+"\" | python myseg.py > ./setoutput.txt");		 
			console.log("Segmentation completed!");
			console.log("\n")
			console.log("***************************");
			segoutput = fs.readFileSync('setoutput.txt','utf8');
			console.log("THIS IS THE SYLLABLE OUTPUT");
			console.log("***************************");
			console.log(segoutput);	
			console.log("\n");
			console.log("Loading Phrase-Based Statistical Machine Translation has started!!");
			const spa = spawn ("echo \""+segoutput+"\" | /home/thaesue/smt_se/mosesdecoder/bin/moses -f /home/thaesue/smt_se/Data/syllable-data/model3/my-en/tuning/moses.ini > ./output.txt");
			console.log("Parsing the sentence to the Myanmar-to-Englsih PBSMT Model and Traslating the sentence completed!");
			console.log('\n');
			console.log("***************************");
			console.log("THIS IS THE TRANSLATED OUTPUT");
			console.log("***************************");
			contents = fs.readFileSync('output.txt','utf8');
			console.log(contents);
			response = { "text": ""+ contents };    	
		
		}else{
			console.log("English Sentence is received");
			console.log("THE RECEIVED SENTENCE is--");
			console.log(search_text);
			console.log("Loading Phrase-Based Statistical Machine Translation has started!!");
			const command = spawn ("echo \""+search_text+"\" | /home/thaesue/smt_se/mosesdecoder/bin/moses -f /home/thaesue/smt_se/Data/syllable-data/model9/en-my/tuning/moses.ini > ./output.txt");
			console.log("Parsing the sentence to the Myanmar-to-Englsih PBSMT Model and Traslating the sentence completed!");
	                contents = fs.readFileSync('output.txt','utf8');
			console.log(contents);
			var n = contents.replace(" ", "");
			response = { "text": ""+ n };	
		}	 
  
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
  };
  
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

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening 1337'));

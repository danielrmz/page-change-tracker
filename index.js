#!/usr/bin/env node

var webshot    = require('webshot');
var cloudinary = require('cloudinary');
var blinkdiff  = require('blink-diff'); 
var fs         = require('fs'); 
var PNGImage   = require('pngjs-image');
var Request    = require('request').defaults({ encoding: null });

// Url for which to compare with previous.
var url = process.env.CHECK_URL;

// Options for the screenshot.
var options = {
  defaultWhiteBackground: true,
  quality: 100, 
  userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
  captureSelector: process.env.CHECK_PAGE_SELECTOR,  
  renderDelay: 5000,
  errorIfJSException: function() {
    console.log("ERROR: ", arguments);
  },
  streaming: true,
  customCSS: "td { font-family:'arial' !important; font-size: 12px !important; }"
};
  
function sendNotificationSMS() {

  if(!process.env.CHECK_NOTIFICATION_SMSNUMBER || !process.env.EASYSMS_URL) {
    console.error('SMS Configuration not set.');
    return;
  }

  var options = {
    uri: process.env.EASYSMS_URL + "/messages",
    method: 'POST',
    json: 
    {
      "to": process.env.CHECK_NOTIFICATION_SMSNUMBER,
      "body": "Found some differences in the page you're tracking. " + (process.env.CHECK_URL_SHORT || "")
    }
  };

  Request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body) // Print the shortened url.
    }
  });
}

function sendNotificationEmail(prevImg, currImg) {
  sendNotificationSMS();

  var helper = require('sendgrid').mail;
  var from_email = new helper.Email(process.env.CHECK_NOTIFICATION_EMAIL);
  var to_email = new helper.Email(process.env.CHECK_NOTIFICATION_EMAIL);
  var subject = process.env.CHECK_NOTIFICATION_TITLE;
  var content = new helper.Content('text/html', 'Page changes detected! <br /><br />Url: ' + process.env.CHECK_URL + ' <br /><br /><table><tr><td>Previous</td><td></td><td>Current</td></tr><tr><td><img src="cid:previous.png"/></td><td> vs. </td><td><img src="cid:current.png"/></td></tr></table>');
  var mail = new helper.Mail(from_email, subject, to_email, content);

  var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);

  Request(prevImg, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          var prevData = (new Buffer(body).toString('base64'));
           
          Request(currImg, function (error1, response1, body1) {
              if (!error1 && response1.statusCode == 200) {
                  var currData = (new Buffer(body1).toString('base64'));
                  
                  var currAtt = new helper.Attachment(); 
                  currAtt.setContent(currData);
                  currAtt.setType(response1.headers["content-type"]);
                  currAtt.setFilename('current.png'); 
                  currAtt.setDisposition('inline');
                  currAtt.setContentId('current.png');

                  mail.addAttachment(currAtt);

                  var prevAtt = new helper.Attachment(); 
                  prevAtt.setContent(prevData);
                  prevAtt.setType(response.headers["content-type"]);
                  prevAtt.setFilename('previous.png'); 
                  prevAtt.setDisposition('inline');
                  prevAtt.setContentId('previous.png');

                  mail.addAttachment(prevAtt);
              
                  var request = sg.emptyRequest({ method: 'POST', path: '/v3/mail/send', body: mail.toJSON() });
       
                  sg.API(request, function(error, response) {
                      console.log(response.statusCode);
                      console.log(response.body);
                      console.log(response.headers);
                  });

           }
          });
      }
  });

  
};


function compareImages(prevImgUrl, currImgUrl) {
    PNGImage.readImage(prevImgUrl, function (err, prev) {
        if (err) throw err;
     
        PNGImage.readImage(currImgUrl, function (err1, curr) {
            if (err1) throw err1;
            
            var diff = new blinkdiff({
                imageA: prev,  
                imageB: curr,

                thresholdType: blinkdiff.THRESHOLD_PIXEL,
                threshold: 0.00, // 1% threshold 
            });

            diff.run(function (error, result) {
              if (error) {
                  throw error;
              } else {
                  if(!diff.hasPassed(result.code)) {
                    sendNotificationEmail(prevImgUrl, currImgUrl);
                  }
                  console.log(diff.hasPassed(result.code) ? 'Passed' : 'Failed');
                  console.log('Found ' + result.differences + ' differences.');
              }
            });
        });
    }); 
};
  

function startProcess() {
  cloudinary.api.resource('current', 
    function(result) {
      if(result.http_code != 404) {
        // Once resolved, if there was a previous image compare them. 

        cloudinary.uploader.rename('current', 'previous', function(rr) {

          console.log("New Previous: ", rr);

          webshot(url, options, function(err, stream){  
            var cstream = cloudinary.uploader.upload_stream(function(currentImageData) { 
                console.log("New Current: ", currentImageData);

                var currentImage = currentImageData.url;
                var previousImage = rr.url; 
                
                compareImages(previousImage, currentImage); 
            }, 
            { 
              public_id: 'current', 
              tags: [ new Date().toISOString().split('.')[0] ] 
            });

            stream.pipe(cstream); 
          }); 
        }, { overwrite: true }); 
      } else {

        // Fetch current screenshot from source.
        webshot(url, options, function(err, stream){  
          var cstream = cloudinary.uploader.upload_stream(function(currentImageData) { }, { public_id: 'current', tags: [ new Date().toISOString().split('.')[0] ] });
          stream.pipe(cstream); 
        }); 

      }

       
    }
  );

};

if(require.main === module) {
  startProcess();
} else {
  module.exports = {
      startProcess: startProcess
  };
}
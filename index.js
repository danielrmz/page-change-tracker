#!/usr/bin/env node

var webshot    = require('webshot');
var cloudinary = require('cloudinary');
var blinkdiff  = require('blink-diff');
var request    = require('request');
var fs         = require('fs'); 
var PNGImage   = require('pngjs-image');

// Url for which to compare with previous.
var url = process.env.CHECK_URL;

// Options for the screenshot.
var options = {
  defaultWhiteBackground: true,
  quality: 100, 
  userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
  captureSelector: "body center table:nth-child(2) tbody tr:nth-child(2) td:nth-child(2) table:nth-child(2) tbody tr td:nth-child(2) table", 
  renderDelay: 1000,
  errorIfJSException: function() {
    console.log("ERROR: ", arguments);
  },
  streaming: true
};
  
function sendNotificationEmail(prevImg, currImg) {
  debugger;
  var helper = require('sendgrid').mail;
  var from_email = new helper.Email(process.env.CHECK_NOTIFICATION_EMAIL);
  var to_email = new helper.Email(process.env.CHECK_NOTIFICATION_EMAIL);
  var subject = process.env.CHECK_NOTIFICATION_TITLE;
  var content = new helper.Content('text/html', 'Page changes detected! <br /><br /><table><tr><td>Previous</td><td></td><td>Current</td></tr><tr><td><img src="'+prevImg+'"/></td><td> vs. </td><td><img src="'+currImg+'"/></td></tr></table>');
  var mail = new helper.Mail(from_email, subject, to_email, content);

  var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
  var request = sg.emptyRequest({ method: 'POST', path: '/v3/mail/send', body: mail.toJSON() });

  sg.API(request, function(error, response) {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
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
      var hasPreviousImage = false;
      if(result.http_code != 404) {
        hasPreviousImage = true;
        debugger;
        cloudinary.uploader.rename('current', 'previous', function() {

          // Fetch current screenshot from source.
          webshot(url, options, function(err, stream){  
            var cstream = cloudinary.uploader.upload_stream(function(currentImageData) { 
                // Once resolved, if there was a previous image compare them. 
                if(hasPreviousImage) {
                  var currentImage = currentImageData.url;
                  var previousImage = cloudinary.url("previous");
                  
                  compareImages(previousImage, currentImage);
                }
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
          var cstream = cloudinary.uploader.upload_stream(function(currentImageData) { 
              // Once resolved, if there was a previous image compare them. 
              if(hasPreviousImage) {
                var currentImage = currentImageData.url;
                var previousImage = cloudinary.url("previous");
                
                compareImages(previousImage, currentImage);
              }
          }, 
          { 
            public_id: 'current', 
            tags: [ new Date().toISOString().split('.')[0] ] 
          });

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
var webshot = require('webshot');

var selector = "body > center:nth-child(1) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1)";

selector ="#readme";

var options = {
  defaultWhiteBackground: true,
  quality: 100,
  siteType: 'url',
  userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
  captureSelector: selector
};

var url = "http://tvtickets.com/fmi/shows/browserecord.php?show=The%20Big%20Bang%20Theory";
url = "https://github.com/kpdecker/node-resemble";

webshot(url, 
    'current.png', 
    function(err) {
      // screenshot now saved to google.png 
    }
);  

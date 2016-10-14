
var Tracker = require('./index.js');

setInterval(
    function() {
        
        console.log("- Processing...");
        Tracker.startProcess(); 
        console.log("- Done...");
    },
    1000 * 60 * process.env.CHECK_NOTIFICATION_INTERVAL
);

Tracker.startProcess(); 

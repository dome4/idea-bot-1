const { RTMClient } = require('@slack/client');

// An access token (from your Slack app or custom integration - usually xoxb)
const token = 'xoxb-361900915170-O05v4IOVXaPcyCIsM35HNJEK';

// init sqlite db
var fs = require('fs');
var dbFile = './.data/sqlite5.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE Ideas (idea TEXT)');
    //console.log('New table Dreams created!');
    
    // insert default dreams
    db.serialize(function() {
      db.run('INSERT INTO Ideas (idea) VALUES ("Slack Bot der Ideen sammelt und Inspiration verteilt")');
    });
  }
  else {
    //console.log('Database "Dreams" ready to go!');
    db.each('SELECT * from Ideas', function(err, row) {
      if ( row ) {
        console.log('record:', row);
      }
    });
  }
});

// The client is initialized and then started to get an active connection to the platform
const rtm = new RTMClient(token);
rtm.start();


  
rtm.on('message', function handleRtmMessage(message) {

  

  if (message.text.includes("#inspire")) {
    db.all('SELECT * from Ideas ORDER BY RANDOM() LIMIT 1', function(err, rows) {

      var message1 = rows[0].idea
      rtm.sendMessage(message1, message.channel);

    });
  } else if (message.text.includes("#new")){
      var message2 = message.text.split('#new ')[1];
      console.log(message2);

    db.run(`INSERT INTO Ideas (idea) VALUES ('${message2}')`, () => {}, (error) => console.log(error));
    rtm.sendMessage('Neue Idee hinzugefügt!', message.channel);
  } else if (message.text.includes("#help")) {
    rtm.sendMessage('type #inspire to get an innovative idea or #new <idea> to submit your own idea', message.channel);
  }
  else {
    rtm.sendMessage('type #help!', message.channel);
  }



});
 
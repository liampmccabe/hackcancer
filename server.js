var express = require('express'),
    app = express(),
    server = require('http').createServer(app);

//Set directory that will be served
app.use(express.static(__dirname + '/dist'));

//Set the port to use
app.set('port', process.env.PORT || 5000);

//Start our server
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;

'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

var os = require('os');

var Schema = mongoose.Schema;
var app = express();


app.use(bodyParser.urlencoded({ extended: false }))

app.use(cors());

app.use('/public', express.static(process.cwd() + '/public'));
app.set('view engine', 'ejs');

var shortUrlSchema = new Schema({
  url: { type: String },
  shortenUrl: String
});

var shortUrl = mongoose.model('ShortUrl', shortUrlSchema);

shortUrl.countDocuments(function (err, count) {
  if (!err && count === 0) {
    var urlobj = new shortUrl({ url: "temp", shortenUrl: "-1" });
    urlobj.save();
  }
});


var port = 3000;

mongoose.connect("mongodb+srv://admin:admin@urlshortner-ywk5l.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', function (req, res) {
  res.render("index");
});


app.get("/api/hello", function (req, res) {
  res.json({ greeting: 'hello API' });
});


app.post("/api/shorturl/new", function (req, res) {

  const expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  const url_valid = new RegExp(expression);

  let url = req.body.url;
  if (url.match(url_valid)) {

    shortUrl.countDocuments(function (err, count) {
      if (err) {
        console.log(err);
      }
      else {
        let urlobj = new shortUrl({
          url: url,
          shortenUrl: count.toString()
        });

        urlobj.save();
        console.log("saved successfully");
        // res.json(
        //   { "original_url": urlobj.url, "short_url": urlobj.shortenUrl }
        // );
        res.render("response", {
          urlobj, path: req.hostname
            + "/api/shorturl/new/" + urlobj.shortenUrl
        });


      }
    });
  }
  else {
    res.json({
      "error": "invalid URL"
    });
  }

});


app.get('/api/shorturl/:shortURL', function (req, res) {
  var short_url = req.params.shortURL;

  shortUrl.findOne({ shortenUrl: short_url }, function (err, obj) {
    if (err) {
      console.log(err);
      res.json({ "error": "invalid URL" });
    }
    else {
      res.redirect(obj.url);
    }

  })


});

app.listen(port, function () {
  console.log('Node.js listening ...');
});

/**
 * Micheal Nguyen
 * University of Oklahoma
 * Assignment 1
 * Professor Park CS 3203
 * February 27, 2022
 */
//List of all included dependancies 
const express = require('express');
const app = express();
const path=require('path');
const http = require('http');
const fs=require('fs');
const cons=require('consolidate');
const bodyParser = require('body-parser');
const cors = require('cors');
const res = require('express/lib/response');
const PORT=3000;
// tweets and users are stored locally
let tweets = [];
let users = [];
app.use(cors());

// configuring dependancies 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
//use the html as the opening page when localhost:3000 is opened. 
app.use(express.static('views'));
//reads in a json then parses it into 2 objects, tweets and users.
fs.readFile('./favs.json', 'utf-8', (err, jsonString) => {
    
    if(err){
        console.error(err)
        return
    }
    try{
      var data = JSON.parse(jsonString);
    } catch(err){
        console.error(err);
    }
    //iterates over the parsed jsonstring and creates the new user and tweet objects
   for (var key = 0; key < data.length; key++) {
    var obj = data[key];
    const newUser = new Object({
        user_id: obj.user.id_str,
        username: obj.user.screen_name,
        fullname: obj.user.name,
    })
    users.push(newUser);
    const newTweet = new Object({
        user_id: obj.user.id_str,
        tweet_id: obj.id_str,
        text: obj.text,
        created_at: obj.created_at

    })
    tweets.push(newTweet);
   }
});
//post function to take in new tweets and create them
app.post('/post', (req, res) => {
    //generate a new tweet id
    const tweetID= generateRandomString(10);
    //takes the body of the request splits them into their individual components then creates a new tweet object
    const newTweet= new Object({
        user_id: req.body.user_id,
        tweet_id: tweetID,
        text: req.body.text,
        created_at: Date((Date.now))
    })
    tweets.push(newTweet);
});
//get response that sends all tweets
app.get('/apiTweet', (req, res) => {
    res.json(tweets);
});
//get response that sends all users
app.get('/apiUser', (req, res) => {
    res.json(users);
});
//get response that sends tweet details given a user id.
app.get('/TweetbyID/:userid', (req, res) => {
    const userid = req.params.userid;
    let tempTweets = [];
    tempTweets = tweets.filter((tweet)=> tweet.user_id == userid);
    res.json(tempTweets);
});
//delete response that takes a tweet id and proceeds to delete that matching tweet
app.delete('/delete/:tweet_id', (req, res, next) => {
//filter call that generates a new tweets array without the tweet of the given id
    tweets = tweets.filter((tweet)=> tweet.tweet_id !==req.params.tweet_id)
    res.status(200).send();
});
//put response that updates a user name given the old user name and the new chosen username 
app.put('/put/:username/:newname', (req, res, next) => {
     var username2=req.params.username;
     var newname=req.params.newname;
     //loop to find the username
     for(var i=0;i<users.length;i++){
         if(users[i].username === username2){
            users[i].username = newname;
         }
     }
     res.status(200).send();
 
 });
 //function to generate a random string of text to be used as an id
const generateRandomString = (myLength) => {
    const chars =
      "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
    const randomArray = Array.from(
      { length: myLength },
      (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );
  
    const randomString = randomArray.join("");
    return randomString;
  };
//server opens to port 3000 console log to show that server opens.
app.listen(PORT, () => console.log(`Hello world app listening on port ${PORT}!`));
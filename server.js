/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.route('/signup')
    .post(function(req, res) {
        if (!req.body.username || !req.body.password) {
            res.json({success: false, msg: 'Please include both username and password to signup.'})
        } else {
            var user = new User();
            user.name = req.body.name;
            user.username = req.body.username;
            user.password = req.body.password;

            user.save(function (err) {
                if (err) {
                    if (err.code == 11000)
                        return res.json({success: false, message: "A user with that username already exists"});
                    else
                        return res.json(err);
                }

                res.json({success: true, msg: 'Successfully created new user.'});
            });
        }
    })


    .all(function(req, res){
        res.json({success: false, msg: 'This HTTP method is not supported.'});
    }
    );

router.route('/signin')
    .post(function (req, res) {
        var userNew = new User();
        userNew.username = req.body.username;
        userNew.password = req.body.password;

        User.findOne({username : userNew.username}).select('name username password').exec(function (err, user){
            if(err){
                res.send(err);
            }
            user.comparePassword(userNew.password, function(isMatch){
                if(isMatch){
                    var userToken = {id: user.id, username: user.username};
                    var token = jwt.sign(userToken, process.env.SECRET_KEY);
                    res.json ({success: true, token: 'JWT ' + token});

                }
                else{
                    res.status(401).send({success: false, msg: 'Authentication failed.'});
                }
            })
        })



    .all(function(req, res) {
        res.json({success: false, msg: 'This HTTP method is not supported.'});
    }
    );

router.route('/movies')
    .delete(authController.isAuthenticated, function(req, res) {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObjectForMovieRequirement(req);
        o.msg = "movie deleted";
        res.json(o);

    }
    )
    .put(authJwtController.isAuthenticated, function(req, res) {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObjectForMovieRequirement(req);
        o.msg = "movie updated";
        res.json(o);
    }
    )
    .get(function (req, res) {
        console.log(req.body);
        res = res.status(200);
        if(req.get('Content-Type')){
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObjectForMovieRequirement(req);
        o.msg = "GET movies";
        res.json(o);
    }
    )
    .post(function (req, res) {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObjectForMovieRequirement(req);
        o.msg = "movie saved";
        res.json(o);
    }
    )
    .all(function(req, res){
        res.json({success: false, msg: "This HTTP method is not supported."});

    });

router.all('/', function (req, res) {
    res.json({success: false, msg: 'This route is not supported.'});
})

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only



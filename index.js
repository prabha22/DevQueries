var express=require('express');
var mongoose=require('mongoose');
var bodyParser=require('body-parser');
var app=express();
var methodOverride=require('method-override');
var flash=require('connect-flash');
var User=require('./modals/user');
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var passportLocalMongoose=require("passport-local-mongoose");
var bcrypt =require ('bcrypt-nodejs');
var  async=require('async');
var Forum=require('./modals/forum');
var Comment=require('./modals/comment');


//Database Connection and Application COnfiguration
mongoose.connect('mongodb://localhost/devQueries', function(err){
  if(err)
  console.log("Error Connecting to Database");
  else{
    console.log('Success, Connection to DB Established!');
  }
});
//body parser use
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(flash());


// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//Blog Schema defined
var blogSchema= new mongoose.Schema({
title:String,
image:String,
body:String,
created:{type:Date, default:Date.now}

});

var Blog=mongoose.model("Blog", blogSchema);

/*Blog.create({
  title:"First Blog",
  image:"",
  body:"THis is first Blog App"
});*/


//login...
app.get("/login", function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('login', { message: req.flash('loginMessage')});
});

/*app.get("/login",function(req,res){
  res.render("login");
});*/
app.get('/login', function(req, res, next) {
  User.findOne({_id:req.user._id},function(err,user){
    if(err) return next(err);
  res.render('blogs',{ user:user });
});
});


/*app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/blogs",
        failureRedirect: "/login"
    }), function(req, res){
});*/


app.post('/login',passport.authenticate('local',{failureRedirect:'/login',failureFlash:'Invalid Username or Password'}), function(req,res) {

	//If Local Strategy Comes True
	console.log('Authentication Successful');
	req.flash('success','You are Logged In');
	res.redirect('/');

});




//Signup..
app.get("/signup", function(req,res){
  res.render("signup")
});

//handle sign up logic
app.post("/signup", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);

            return res.render("login");
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to YelpCamp " + user.username);
           res.redirect("/");
        });
    });
});


/*app.get('/signup', function(req, res, next) {
  res.render('signup', {
    errors: req.flash('errors')
  });
});

app.post('/signup', function(req, res, next) {

async.waterfall([
  function(callback){
    var user = new User();
    user.usename = req.body.name;
    user.email = req.body.email;
    user.password = req.body.password;


    User.findOne({ email: req.body.email }, function(err, existingUser) {

      if (existingUser) {
        req.flash('errors', 'Account with that email address already exists');
        return res.redirect('/signup');
      } else {
        user.save(function(err, user) {
          if (err) return next(err);
          callback(null,user);

          });
      }
    });
  },
  function(user){
    var cart=new Cart();
    cart.owner=user._id;
    cart.save(function(err){
      if(err) return next(err);
      req.logIn(user,function(err){
        if(err) return next(err);
        res.redirect('/login');
      });
    });
  }
]);
})*/




//RESTFUL ROUTES
app.get("/", function(req,res){
  res.redirect("/blogs");
});
app.get("/blogs", function(req,res){
  Blog.find({}, function(err, blogs){
    if(err)
    console.log("Error Retrieving Blogs");
    else {
        res.render("index",{blogs:blogs});
    }
  });
});

app.post('/blogs', function(req,res){
Blog.create(req.body.blog, function(err,newBlog){
  if(err)
  res.render("new");
  else
  res.redirect("/blogs");
});
});
app.get('/blogs/new', function(req,res){
  res.render('new');
});


//Show blog..
app.get("/blogs/:id", function(req,res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err)
    res.redirect("/blogs");
    else {
      res.render("show",{blog:foundBlog});
    }
  });
});

//EDIT PAGE
app.get('/blogs/:id/edit', function(req,res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err)
    res.redirect("/blogs");
    else {
      res.render("edit",{blog:foundBlog});
    }
  });
  });

//To put
app.put("/blogs/:id", function(req,res){
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
    if(err)
    res.redirect("/blogs");
    else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

//delete
app.delete("/blogs/:id", function(req,res){
  Blog.findByIdAndRemove(req.params.id, function(err){
    if(err)
    res.redirect("/blogs");
    else {
      res.redirect("/blogs");
    }
  });
});

app.post('/forums', function(req, res){
  Forum.create(req.body.forum, function(err,newForum){
    if(err)
    res.render("newforum");
    else
    res.redirect("/forums");
  });
  });

  app.get('/forums/new', function(req,res){
    res.render('newforum');
  });

app.get('/forums', function(req, res){
  Forum.find({}, function(err, forums){
    if(err)
    console.log("Error Retrieving Forum right now...");
    else {
      res.render('forum', {forums:forums});
    }
  });
});


app.get("/forums/:id", function(req,res){
  Forum.findById(req.params.id, function(err, foundForum){
    if(err)
    res.redirect("/forums");
    else {
      res.render("showForum",{forum:foundForum});
    }
  });
});

//EDIT PAGE
app.get('/forums/:id/edit', function(req,res){
  Forum.findById(req.params.id, function(err, foundForum){
    if(err)
    res.redirect("/forums");
    else {
      res.render("editForum",{forum:foundForum});
    }
  });
  });

//To put
app.put("/forums/:id", function(req,res){
  Forum.findByIdAndUpdate(req.params.id, req.body.forum, function(err, updatedForum){
    if(err)
    res.redirect("/forums");
    else {
      res.redirect("/forums/" + req.params.id);
    }
  });
});

//delete
app.delete("/forums/:id", function(req,res){
  Forum.findByIdAndRemove(req.params.id, function(err){
    if(err)
    res.redirect("/forums");
    else {
      res.redirect("/forums");
    }
  });
});

//comment


app.listen('3000', function(req,res){
  console.log("Server Running.....");
});

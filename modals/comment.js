var mongoose=require('mongoose');

var CommentSchema=new mongoose.Schema({
  text:String
});


module.exports=mongoose.model('Comment', CommentSchema);

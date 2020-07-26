var mongoose=require('mongoose');
var ForumSchema=new mongoose.Schema({
  topic:String,
  description:String,
  created:{type:Date, default:Date.now},
  answer:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Comment"

    }
  ]
});

module.exports = mongoose.model("Forum", ForumSchema);

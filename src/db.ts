import { Mongoose,model,Schema, Types } from "mongoose";
import { string } from "zod";
 
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const contentTypes = ['image', 'video', 'article', 'audio']
const contentSchema = new Schema({
    link : {type : String , required : true}, 
    type : {type : String , enum : contentTypes},
    title : {type : String , required : true},
    tags : [{ type : Types.ObjectId, ref:"Tag"}],
    userId : {type : Types.ObjectId, ref:"User"}

});

const TagSchema = new Schema({
    title : {type : String , required : true}
});

const LinkSchema = new  Schema({
    hash : {type:String,required : true},
    userId : {type : Types.ObjectId, ref:'User', required : true , unique : true},
});

export const Usermodel =  model("User",userSchema);
export const ContentModel = model("Content",contentSchema);
export const TagModel = model("Tag",TagSchema);
export const LinkModel = model("Link",LinkSchema);

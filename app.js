import express from 'express';
let app = express();
import { MongoClient as _MongoClient, ObjectId } from 'mongodb';
const MongoClient = _MongoClient;
import { config } from 'dotenv';
config()
let port = process.env.PORT || 8081;
const mongoUrl = process.env.mongoLiveUrl
import { urlencoded, json } from 'body-parser';
import cors from 'cors';

//middleware

app.use(urlencoded({extended:true}))
app.use(json())
app.use(cors())

//location
app.get('/location',(req,res) => {
    db.collection('location').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//restaurants
app.get('/restaurants/',(req,res) => {
    // let id = req.params.id;
    // let id  = req.query.id
    // console.log(">>>id",id)
    let query = {};
    let stateId = Number(req.query.state_id)
    let mealId = Number(req.query.meal_id)
    if(stateId){
        query = {state_id:stateId}
    }else if(mealId){
        query = {'mealTypes.mealtype_id':mealId}
    }

    db.collection('restaurants').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})


app.get('/Mealtypes/:id',(req,res) => {
    //let restId = Number(req.params.id);
    let restId = ObjectId(req.params.id)
    db.collection('Mealtypes').find({_id:restId}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})


//menu
app.get('/menu',(req,res) => {
    let query = {}
    let restId = Number(req.query.restId)
    if(restId){
        query = {restaurant_id:restId}
    }
    db.collection('menu').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//post
app.post('/menuItem',(req,res) => {
    console.log(req.body);
    if(Array.isArray(req.body)){
        db.collection('menu').find({menu_id:{$in:req.body}}).toArray((err,result) => {
            if(err) throw err;
            res.send(result)
        })
    }else{
        res.send('Invalid Input')
    }
})

// place Order
app.post('/placeOrder',(req,res) => {
    db.collection('orders').insert(req.body,(err,result) => {
        if(err) throw err;
        res.send('Order Placed')
    })
})


// View Order
app.get('/viewOrder',(req,res) => {
    let email = req.query.email;
    let query = {};
    if(email){
        query = {"email":email}
    }
    db.collection('orders').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

// delete order
app.delete('/deleteOrders',(req,res)=>{
    db.collection('orders').remove({},(err,result) => {
        res.send('order deleted')
    })
})


//update orders
app.put('/updateOrder/:id',(req,res) => {
    let oId = ObjectId(req.params.id);
    db.collection('orders').updateOne(
        {_id:oId},
        {$set:{
            "status":req.body.status,
            "bank_name":req.body.bankName
        }},(err,result) => {
            if(err) throw err
            res.send(`Status Updated to ${req.body.status}`)
        }
    )
})  

//DB connection


MongoClient.connect(mongoUrl, (err,client)=>{
    console.log("mongourl", mongoUrl)
    if(err) console.log("Error while Connecting......", err);
    db = client.db('flipkart')
    app.listen(port, ()=>{
        console.log(`server is running on port ${port} `)
    })
})
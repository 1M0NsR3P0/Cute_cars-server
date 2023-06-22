const express = require('express')
const cors = require('cors')
require('dotenv').config() 
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())



// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}s@cluster0.d1kr80i.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d1kr80i.mongodb.net/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const database = client.db("ToyShop");
        const userCollection = database.collection("toys");
        const newArrival = database.collection('newArrival')
        const userAddedToys = database.collection('sellerData')
        const myToysCollection = database.collection('MyToys')
        const CartCollections = database.collection('cart')



        //alltoys will get all the toys from data base with user added toys and all user added toys also will be included here!
        app.get('/alltoys',async(req,res)=>{
            const cursor = userCollection.find()
            const result = await cursor.toArray();
            res.send(result)
        })
        // on home page the new upcoming toys will shown from here
        app.get('/newarrival',async(req,res)=>{
            const cursor = newArrival.find()
            const result = await cursor.toArray();
            res.send(result)
        })
        // this get req will find a user toys list with filtering user email. not the brand or toys owner email
        app.get('/mytoys/:email',async(req,res)=>{
            const email = req.params.email
            const findMytoys = {userMail: email}
            const cursor = myToysCollection.find(findMytoys)
            const result = await cursor.toArray();
            res.send(result)
        })
        // with this req all the toys of all the user added will be get from ddatabase
        app.get('/usertoys/limit20',async(req,res)=>{
            const cursor = userAddedToys.find().limit(20)
            const result = await cursor.toArray();
            res.send(result)
        })
        
        app.get('/usertoys',async(req,res)=>{
            const cursor = userAddedToys.find()
            const result = await cursor.toArray();
            res.send(result)
        })
        


        // post methods
        // this post methos will add a toy with user name o
        app.post('/addtoy', async(req, res) => {
            const addThisToy = req.body
            const result = await userAddedToys.insertOne(addThisToy);
            const result2 = await userCollection.insertOne(addThisToy);
            const result3 = await myToysCollection.insertOne(addThisToy);
            console.log(result)
            res.send({result,result2,result3});
        })
        app.post('/cart',async(req,res)=>{
            const cartItem = req.body
            const result = await CartCollections.insertOne(cartItem)
            res.send(result)
        })

        app.get('/carts',async(req,res)=>{
            const email = req.query.email
            console.log(email)
            if(!email){
                res.send("not found!!")
            }
            const query = { mail: email };
            console.log(query)
            const result =await CartCollections.find(query).toArray()
            res.send(result)
        })
        app.get('/alltoys/mytoys/:email',async(req,res)=>{
            const email = req.params.email
            const filter = { userMail: email };
            const options = { projection: { userMail : 0 } };
            const result = await userCollection.find(filter, options).toArray();
            console.log(result)
            res.send(result)
        })
        app.get('/alltoys/sportscar',async(req,res)=>{
            
            const filter = { category: 'Sports Car' };
            const options = { projection: { category : 0 } };
            const result = await userCollection.find(filter, options).toArray();
            console.log(result)
            res.send(result)
        })
        app.get('/alltoys/toytruck',async(req,res)=>{
            
            const filter = { category: 'Toy Truck' };
            const options = { projection: { category : 0 } };
            const result = await userCollection.find(filter, options).toArray();
            console.log(result)
            res.send(result)
        })
        app.get('/alltoys/rollerscater',async(req,res)=>{
            
            const filter = { category: 'Roller Scater' };
            const options = { projection: { category : 0 } };
            const result = await userCollection.find(filter, options).toArray();
            console.log(result)
            res.send(result)
        })
        app.get('/toytruck_sort/:order',async(req,res)=>{
            const sortBY = req.params.order;
            if(!sortBY){
                sortBY = 1
            }
            const filter = { category: 'Toy Truck' };
            const options = { projection: { category : 0 } };
            const result = await userCollection.find(filter, options).sort({ name: sortBY }).toArray();
            console.log(result)
            res.send(result)
        })
        app.delete('/addtoy/:id',async(req,res)=>{
            const id = req.params.id
            console.log('deleting:',id)
            const query = {_id:new ObjectId(id)}
            const result = await userCollection.deleteOne(query);
            res.send(result)

        })

        app.get(`/mytoys/:id`,async(req,res)=>{
            const id = req.params.id
            const query = {_id: new ObjectId(id)}
            const result = await myToysCollection.deleteOne(query)
            res.send(result)

        })
        app.put('/users/:id',async(req,res)=>{
            const id = req.params.id;
            const user = req.body;
            console.log(user)
            const filter = {_id: new ObjectId(id)}
            const options = {upsert:true}
            const updatedUSer = {
                $set:{
                    name:user.name,
                    email:user.email
                }
            }
            const update = await userCollection.updateOne(filter,updatedUSer,options)
            res.send(update)

        })


        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('server is running try to cathc data')
})



app.listen(port, () => {
    console.log('express server is running on port: ', port)
})

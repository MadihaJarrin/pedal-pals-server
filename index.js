const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vo35w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);

async function run() {
    try {
        await client.connect();
        console.log("database connect successfully");
        const database = client.db('PedalPals');
        const productsCollection = database.collection('products');
        const orderCollection = database.collection('addOrder');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');
        // console.log(productsCollection);

        //GET PRODUCTS API 
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
            // console.log(products);
        })
        //POST Products API
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log("hit the post api ", product);
            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result);
        });

        //GET SINGLE Products api 
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })
        //Delete products
        app.delete('/deleteProducts/:id', async (req, res) => {
            console.log(req.params.id);
            const result = await productsCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        })

        //ADD ORDER Product
        app.post('/addOrder', async (req, res) => {
            console.log(req.body);
            orderCollection.insertOne(req.body).then((result) => {
                console.log(result);
                req.json(result);
            })

        })
        //GET MYORDER 
        app.get('/myOrder/:email', (req, res) => {
            orderCollection.find({ email: req.params.email })
                .toArray((err, items) => {
                    res.send(items);
                    // console.log(items);
                })
        })
        //Delete Order
        app.delete('/deleteOrder/:id', async (req, res) => {
            console.log(req.params.id);
            const result = await orderCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        })


        //POST reviews API
        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            console.log("hit the post api ", reviews);
            const result = await reviewsCollection.insertOne(reviews);
            console.log(result);
            res.json(result);
        });
        // GET API for reviews 
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        //get ALL Order 
        app.get('/allOrder', async (req, res) => {
            orderCollection.find({})
                .toArray((err, items) => {
                    res.send(items);
                })
        })

        //users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Hello from PedalPals");
});
app.listen(port, () => {
    console.log("Listening to port", port);
});

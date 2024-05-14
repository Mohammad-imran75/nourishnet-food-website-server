const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
//CeWvOnGARMERvg8W ,, FoodDB
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.BD_NAME}:${process.env.SECRET_KEY}@cluster0.6f8slkt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const foodCollection = client.db("FoodDB").collection("foodsitem");
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    app.get("/foodsitem", async (req, res) => {
      const result = await foodCollection.find().toArray();
      res.send(result);
    });
    app.post("/foodsitem", async (req, res) => {
      const foodInfo = req.body;
      // console.log(visitor);
      const result = await foodCollection.insertOne(foodInfo);
      res.send(result);
    });
    app.get("/foodsitem", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email };
      }
      console.log(query);
      const result = await foodCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/foodsitem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });
    app.put("/foodsitem/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedfood = req.body;
      const options = { upsert: true };
      const foodDoc = {
        $set: {
          food_name: updatedfood.food_name,
          food_photo: updatedfood.food_photo,
          pickup_location: updatedfood.pickup_location,
          quantity: updatedfood.quantity,
          notes: updatedfood.notes,
          expired_date: updatedfood.expired_date,
          status: updatedfood.status,
        },
      };
      const result = await foodCollection.updateOne(
        filter,
        foodDoc,
        options
      );
      res.send(result);
    });
    app.get("/foodsitem/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(cursor);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server side is runnning");
});
app.listen(port, () => {
  console.log(`Your serever running port is ${port}`);
});

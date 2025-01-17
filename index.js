const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
//CeWvOnGARMERvg8W ,, FoodDB
app.use(cors());
app.use(express.json());


// Jwt
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

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
    const requestCollection = client.db("FoodDB").collection("request");
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    // Middleware to authenticate JWT token
    const authenticateToken = (req, res, next) => {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      if (token == null) return res.sendStatus(401);

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
      });
    };
    // jwt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });
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
      const result = await foodCollection.updateOne(filter, foodDoc, options);
      res.send(result);
    });
    app.get("/foodsitem/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(cursor);
      res.send(result);
    });
    // request related
    app.post("/request", async (req, res) => {
      const foodInfo = req.body;
      // console.log(visitor);
      const result = await requestCollection.insertOne(foodInfo);
      res.send(result);
    });
    app.get("/request", async (req, res) => {
      const result = await requestCollection.find().toArray();
      res.send(result);
    });
    // for quantity
    app.put("/quantity", async (req, res) => {
      try {
        const foodId = req.query.id;
        if (!ObjectId.isValid(foodId)) {
          return res.status(400).send('Invalid ID format');
        }
    
        const food = await foodCollection.findOne({_id: new ObjectId(foodId)});
        if (!food) {
          return res.status(404).send('Food item not found');
        }
    
        let quantity = parseInt(food.quantity, 10);
        if (isNaN(quantity)) {
          return res.status(400).send('Invalid quantity format');
        }
    
        if (quantity > 0) {
          quantity -= 1;
         const result= await foodCollection.updateOne(
            { _id: new ObjectId(foodId) },
            { $set: { quantity: quantity.toString() } }
          );
          return res.status(200).send({text:'Quantity updated successfully'});
        } else {
          return res.status(400).send('Quantity cannot be less than zero');
        }
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
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

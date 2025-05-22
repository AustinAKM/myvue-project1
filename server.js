import express from "express";
// Highlight: Changed require to import
import { MongoClient, ObjectId } from "mongodb";

const app = express();

app.use(express.json());
app.set("port", 3000);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );

  next();
});

let db;

MongoClient.connect(
  "mongodb+srv://austin_db:austindb123@cluster0.auvne.mongodb.net/"
)
  .then((client) => {
    db = client.db("aca");
    console.log("Connected to MongoDB successfully!");
    app.listen(app.get("port"), () => {
      console.log("⁠Express.js server running at localhost:3000");
    });
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
    process.exit(1);
  });

app.use((req, res, next) => {
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Status: ${res.statusCode}`);
  if (req.method === "POST" || req.method === "PUT") {
    console.log(`Body: ${JSON.stringify(req.body, null, 2)}`);
  }
 
  console.log("-------------------------");
  next();
});
 
 
app.get("/", (req, res, next) => {
  res.send("Select a collection, e.g., /collection/messages");
});

app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  return next();
});

app.get("/collection/:collectionName", async (req, res, next) => {
  try {
    const results = await req.collection.find({}).toArray();
    console.log("Get Success");
    res.json(results);
  } catch (err) {
    console.log("Get Error");
    next(err);
  }
});

// Highlight: Removed require and using the already imported ObjectId
app.get("/collection/:collectionName/:id", async (req, res, next) => {
  // Highlight: Changed callback to async/await
  try {
    const result = await req.collection.findOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (e) {
    return next(e);
  }
});

app.post("/collection/:collectionName", async (req, res, next) => {
  try {
    const result = await req.collection.insertOne(req.body);
    res.json(result.ops);
    console.log("Post Success");
  } catch (err) {
    console.log("Post Error");
    next(err);
  }
});

app.put("/collection/:collectionName/:id", async (req, res, next) => {
  try {
    const result = await req.collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.json(
      result.modifiedCount === 1 ? { msg: "success" } : { msg: "error" }
    );
  } catch (err) {
    console.log("Put Error");
    next(err);
  }
});

app.delete("/collection/:collectionName/:id", async (req, res, next) => {
  // Highlight: Changed callback to async/await
  try {
    const result = await req.collection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result.deletedCount === 1 ? { msg: "success" } : { msg: "error" });
  } catch (e) {
    return next(e);
  }
});
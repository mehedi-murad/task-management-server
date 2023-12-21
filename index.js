require('dotenv').config();
const express = require('express')
const app = express();
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l9kydno.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const userCollection = client.db("taskManager").collection("users")
    const taskCollection = client.db("taskManager").collection("tasks")


    //for post users data endpoint
    app.post('/users', async(req, res) => {
        const user = req.body;
        const query = {email:user?.email}
        const existingUser = await userCollection.findOne(query)
        if(existingUser){
          return res.send({message:'User already exist', insertedId:null})
        }
        const result = await userCollection.insertOne(user)
        res.send(result)
      })
    
    //for task post endpoint
    app.post('/tasks', async(req, res) => {
        const mytasks = req.body;
        const result = await taskCollection.insertOne(mytasks)
        res.send(result)
      })

    //for getting task post endpoint
    app.get('/tasks', async(req, res) => {
        const result = await taskCollection.find().toArray()
        res.send(result)
      })

    //for getting toDo details data enpoint
    app.get('/tasks/:id', async(req,res) =>{
        const id = req.params.id;
        // console.log(id)
        const query = {_id: new ObjectId(id)}
        const result = await taskCollection.findOne(query)
        res.send(result)
      })
    
      //for updating to do task
    app.put('/tasks/:id', async(req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const options = {upsert:true}
        const updateToDo = req.body;
        const toDoPost = {
          $set: {
            title: updateToDo.title, 
            details: updateToDo.details, 
            deadline: updateToDo.deadline, 
            priority: updateToDo.priority
          }
        }
        const result = await taskCollection.updateOne(filter, toDoPost, options)
        res.send(result)
      })
 
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Task Manager is here')
})

app.listen(port, () => {
    console.log(`Task Manager is running on port ${port}`);
})
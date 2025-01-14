const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

require('dotenv').config()

// Express
const app = express()
// const port = process.env.PORT || 3000
const port = 3000

app.use(cors())
app.use(express.json())
// app.use(express.bodyParser({limit: '50mb'}))

// Mongoose
const uri = process.env.ATLAS_URI
mongoose.connect(
  uri,
  {
    useNewUrlParser: true,
    useCreateIndex: true 
  }
);
const connection = mongoose.connection
connection.once('open', () => {
  console.log("MongoDB database connection established successfully")
})

// Route
const communityRouter = require('./src/routes/community')
app.use('/community', communityRouter)
app.get('/', (req, res) => {
  res.send("OK").status(200);
});

// Start backend
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port: ${port}`);
});
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

require('dotenv').config()

// Express
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

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
const userRouter = require('./routes/user')
app.use('/user', userRouter)
const communityRouter = require('./routes/community')
app.use('/community', communityRouter)

// Start backend
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
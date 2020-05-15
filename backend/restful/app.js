const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

require('dotenv').config()

// Express
const app = express()
const port = process.env.PORT || 5000

const adminValidator = (req, res, next) => {
  const token = req.headers.token;
  let decoded = undefined;
  try {
      decoded = jwt.verify(token, 'secret');
  } catch(err) {
      res.status(401).send(false)
  }

  if (decoded !== undefined)
  User.findById(decoded._id, function(err, user) {
      if (user !== null)
          if (user.password === decoded.password && user.key && decoded.key && user.admin)
          next()
          else res.status(401).send(false)
      else res.status(401).send(false)
  })
  .catch(err => res.status(400).json('Error: ' + err))
}

// app.use(adminValidator)

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
const adminRouter = require('./routes/admin')
app.use('/admin', adminRouter)
const chatRouter = require('./routes/chat')
app.use('/chat', chatRouter)

// Start backend
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
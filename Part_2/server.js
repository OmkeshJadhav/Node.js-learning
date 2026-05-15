require('dotenv').config()
const express = require('express')
// const cors = require('cors')
const { configureCors } = require('./src/config/cors-config')
const {addTimeStamp, requestLogger} = require('./src/middleware/customMiddleware')

const app = express();
const PORT = process.env.PORT || 3000

app.use(addTimeStamp)
app.use(requestLogger)

// app.use(cors())
app.use(configureCors())
app.use(express.json())

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})
//requires
const express = require("express")
const radarRouter = require('./routes/radar')

//const
const app = express()
const PORT = 8888

//middlewares
app.use(express.json())

//routes
app.use("/radar", radarRouter)
app.use("/",(req, res) => {
    res.send('Welcome Commander Lando Calrissian. The application is ready. May the Force be with you.')
})

app.listen(PORT, () => {
    console.log(`Welcome Commander Lando Calrissian,listen on port ${PORT}`);
})
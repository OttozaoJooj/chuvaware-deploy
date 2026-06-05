require("dotenv").config()

const Fastify = require("fastify")
const cors = require("@fastify/cors")

const sensorRoutes = require("./routes/sensorRoutes")

const app = Fastify({
  logger: true
})

app.register(cors, {
  origin: true
})

app.register(sensorRoutes)

app.listen({
  port: process.env.PORT || 3000,
  host: "0.0.0.0"
})
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST", "DELETE"],
  },
});

connectDB();

app.use(cors({
  origin: allowedOrigin,
  methods: ["GET", "POST", "DELETE"],
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.post("/api/events", (req, res, next) => {
  console.log("New event data:", req.body);
  next();
});

const eventRoutes = require("./routes/eventRoutes");
app.use("/api/events", eventRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});

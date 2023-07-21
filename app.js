const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const errorMiddleWare = require("./middleware/error");

const app = express();

// Route Imports
const users = require("./routes/userRoute");
const loans = require("./routes/loanRoute");

// CORS Middleware
app.use(
  cors({
    origin: "*",
  })
);

// Express Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", users);
app.use("/api/v1", loans);

// Middleware for Error Handling
app.use(errorMiddleWare);

module.exports = app;

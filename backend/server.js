const express = require("express");
const mongoose = require("mongoose");
const apiRoutes = require("./routes/api");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5500;

require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

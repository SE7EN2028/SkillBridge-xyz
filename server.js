const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Project is under development 🚧");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running"));

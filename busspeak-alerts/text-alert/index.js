const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/businput.html");
});

app.get("/IncomingBusResponse", (req, res) => {
  res.sendFile(__dirname + "/busarrived.html");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});


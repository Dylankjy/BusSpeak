const express = require("express");
const app = express();
const port = 3000;
const path = require('path');
const { S3CustomLabels, S3CustomLabelText, activateSQS } = require('./send.js')
const { receiveSQS } = require('./receive.js')
const bodyParser = require("body-parser"); 
//app.use(express.static(path.join(__dirname + 'busspeak-alerts'));
// console.log(__dirname);
// app.use(express.static(__dirname + '/index.js'));

// Parse URL-encoded bodies when sent by HTML forms
app.use(express.urlencoded());

// Parse JSON bodies when sent by clients
app.use(express.json());
app.use(bodyParser.json()); 

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/businput.html");
});

app.get('/test',(req,res)=>{
  res.json({title:"api",message:"root"});
})

app.post('/IncomingBusResponse', async (req, res) => {
  console.log(req.body.bus);  
  console.log(S3CustomLabelText());
  if (S3CustomLabels()) {
    if (req.body.bus == S3CustomLabelText()) {
      await activateSQS(req.body.bus);
      await receiveSQS(express, app);
      res.sendFile(__dirname + "/busarrived.html");
    }
  }  
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

// var sendSQS = require('./send.js');
// app.use('/', sendSQS);
const express = require("express");
const app = express();
const port = 3000;
const path = require('path');
const { S3CustomLabels, S3CustomLabelText, activateSQS } = require('./send.js')
const { receiveSQS } = require('./receive.js')
const bodyParser = require("body-parser"); 
const {spawn} = require('child_process');
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
  var dataToSend;
  const businput = req.body.bus;
  //console.log(path.dirname(__filename));
  const python = spawn('python', ['bus-number-cloud.py']);
  console.log(__dirname);
  // collect data from script
  python.stdout.on('data', async function (data) {
    dataToSend = data.toString();
    console.log(req.body.bus);  
    console.log(S3CustomLabelText());
    console.log(dataToSend);
    if (S3CustomLabels()) {
      // if (req.body.bus == S3CustomLabelText()) {
      if (dataToSend.includes(businput)) {
        await activateSQS(req.body.bus);
        await receiveSQS(express, app);
        res.sendFile(__dirname + "/busarrived.html");
      }
    } 
  });
  // in close event we are sure that stream from child process is closed
  python.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
    //res.send(dataToSend)
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

// var sendSQS = require('./send.js');
// app.use('/', sendSQS);
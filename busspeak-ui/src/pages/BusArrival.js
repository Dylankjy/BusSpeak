import { useState } from "react"
import Hero from "../components/Global/Hero"
// const spawn = require("child_process");

const BusArrival = () => {
    const [formSuccess, setFormSuccess] = useState(null) //on the way
    const [busNumber, setbusNumber] = useState("");//input
    const [busComes, setArrivalSuccess] = useState(null)//arrived

    const handleSubmit = async (e)=>{      
        e.preventDefault();
        console.log(busNumber);

        if(busNumber) {  //if input number
            //Using SQS Queue in Singapore region, not Tokyo atm       
            sendMessage(busNumber)
            setFormSuccess(true)
          } else {
            setFormSuccess(false)
          }

        if(busNumber==='983') { //replace 983 with Modeldata busNo in the future
            receiveMessage()   
            setArrivalSuccess(true)
          } else {
            setArrivalSuccess(false)
          }
    }

    function sendMessage(busNumber) {
        const AWS = require('aws-sdk');
        //AWS.config.loadFromPath('./config.json');
        AWS.config.update({ "accessKeyId": "AKIA4URMTOCRMV4F6A4X", 
        "secretAccessKey": "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", 
        "region": "ap-southeast-1" });
        AWS.config.update({region: 'ap-southeast-1'});

        const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
        const accountId = '868750684322';
        const queueName = 'Bus-SQSQueue';

        const params = {
            MessageBody: JSON.stringify({
            arrival_msg: busNumber + " has arrived!",
            date: (new Date()).toISOString()
            }),
            QueueUrl: `https://sqs.ap-southeast-1.amazonaws.com/${accountId}/${queueName}`
        };

        sqs.sendMessage(params, (err, data) => {
            if (err) {
            console.log("Error", err);
            } else {
                console.log("Successfully added message", data.MessageId);
            }
        });
        return (busNumber);
    }
    
    function receiveMessage() {
        const AWS = require('aws-sdk');
        //AWS.config.loadFromPath('./config.json');
        AWS.config.update({ "accessKeyId": "AKIA4URMTOCRMV4F6A4X", 
        "secretAccessKey": "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", 
        "region": "ap-southeast-1" });
        AWS.config.update({region: 'ap-southeast-1'});

        const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
        const queueUrl = `https://sqs.ap-southeast-1.amazonaws.com/868750684322/Bus-SQSQueue`

        const params = {
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 10,
            VisibilityTimeout: 30,
            WaitTimeSeconds: 0
        };
        
        sqs.receiveMessage(params, function(err, data) {
            if (err) {
            console.log("Receive Error", err);
            } else if (data.Messages) {
        
            var deleteParams = {
                QueueUrl: queueUrl,
                ReceiptHandle: data.Messages[0].ReceiptHandle
            };
    
            var obj = JSON.parse(data.Messages[0].Body);
            console.log(JSON.stringify(obj));
    
            sqs.deleteMessage(deleteParams, function(err, data) {
                if (err) {
                console.log("Delete Error", err);
                } else {
                console.log("Message Deleted", data);         
                }
            });
            return (JSON.stringify(obj) + ' has arrived!');
            }
        });
    }

    // function getModelData(busNumber) {
    //     var dataToSend;
    //     const python = spawn('python', ['bus-number-cloud.py']);

    //     python.stdout.on('data', async function (data) {
    //     dataToSend = data.toString();
    //     console.log(dataToSend);

    //     if (dataToSend.includes(busNumber)) {
    //     sendMessage(busNumber)
    //     receiveMessage();
    //     }
        
    //     });
    //     python.on('close', (code) => {
    //     console.log(`child process close all stdio with code ${code}`);
    //     });
    // }

    return (
        <>
            <Hero title="Wait for bus" subtitle="Know when your bus arrives effortlessly" size="" returnHomeBtn={true} />
            <section className="section">
                <div className="container">

                    <div>
                    <span role="img" aria-label="smileyface">😊</span><b> Hi User! Please input your bus number.</b>
                    </div>

                    <div>
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="stopID">Enter Bus number </label>
                            <input type="text" name='busName' onChange={e => setbusNumber(e.target.value)}></input>
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                    <br></br>
                    {formSuccess && <label className="label">{busNumber}</label>}
                    {busComes && <label className="label">{busNumber + ' has arrived!'}</label>}
                </div>
            </section>
        </>
    )
}

export default BusArrival
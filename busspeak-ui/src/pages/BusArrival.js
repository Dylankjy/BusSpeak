import { useState } from "react"
import Hero from "../components/Global/Hero"
//import { playRaspPi } from "../pages/BusArrivalAlert"

//INCLUDE POLLING TO KEEP RETRIEVING THE NEW UPDATE ON BUS ARRIVAL

const BusArrival = () => {
    const [formSuccess, setFormSuccess] = useState(null) //on the way
    const [busNumber, setbusNumber] = useState("");//input
    const busMsg = busNumber + ' is on the way!'
    const [busComes, setArrivalSuccess] = useState(null)//arrived
    const showMessage = localStorage.getItem('showMessage');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(busNumber);

        setTimeout(runPolling, 2000);

        // POLLING WORKS
        function runPolling() {
            if (busNumber === '962') {//replace 983 with Modeldata busNo in the future
                //Using SQS Queue in Singapore region, not Tokyo atm       
                retrieveRekognitionData(busNumber)
                setFormSuccess(false)
                setArrivalSuccess(true)
                speakText(busNumber)
            } else {
                setFormSuccess(true)
                setArrivalSuccess(false)
                setTimeout(runPolling, 2000);
            }
        }

        // REMOVE COMMENT TAGS TO TEST WITH DEEPLENS
        // function runPolling() {
        //     //remember to activate the model
        //     const AWS = require('aws-sdk');
        //     AWS.config.update({
        //         "accessKeyId": "AKIA4URMTOCRMV4F6A4X",
        //         "secretAccessKey": "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",
        //         "region": "ap-northeast-1"
        //     });
        //     var lambda = new AWS.Lambda();
        //     var params = {
        //         FunctionName: 'Bus-Number-cloud', /* required */
        //         Payload: null
        //     };
        //     lambda.invoke(params, function (err, data) {
        //         if (err)
        //             console.log(err, err.stack); // an error occurred
        //         else
        //             if (busNumber === data) {
        //                 setFormSuccess(false)
        //                 setArrivalSuccess(true)
        //                 speakText(busNumber)
        //                 sendMessage(busNumber)
        //                 receiveMessage()
        //                 console.log(data);           // successful response
        //             }
        //             else {
        //                 setFormSuccess(true)
        //                 setArrivalSuccess(false)
        //                 setTimeout(runPolling, 2000);
        //             }
        //     });
        // }
    }
    function playRaspPi(busNumber) {
        var Stream = require('stream');
        var Speaker = require('speaker');
        const AWS = require('aws-sdk');

        function getPlayer() {
            return new Speaker({
                channels: 1,
                bitDepth: 16,
                sampleRate: 16000
            });
        }

        var speechParams2 = {
            OutputFormat: "pcm",
            SampleRate: "16000",
            Text: "Bus " + busNumber + " has arrived!",
            TextType: "text",
            VoiceId: "Joanna"
        }
        var Polly = new AWS.Polly({ apiVersion: '2016-06-10' });
        //var speak = function(text) {
        //speechParams2.Text = text;
        Polly.synthesizeSpeech(speechParams2, function (err, res) {
            if (err) {
                console.log('err', err)
            } else if (res && res.AudioStream instanceof Buffer) {
                var bufferStream = new Stream.PassThrough()
                bufferStream.end(res.AudioStream)
                bufferStream.pipe(getPlayer());
            }
        })
        //}
    }

    function speakText(busNumber) {
        //var Speaker = require('speaker');
        const AWS = require('aws-sdk');
        //const Stream = require('stream');

        // Initialize the Amazon Cognito credentials provider
        AWS.config.region = 'ap-southeast-1'; // Region
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'ap-southeast-1:0d816bc7-634c-407c-a955-da089686de28',
            //IdentityId: 'busspeakIdentityPool'
        });

        // Create the JSON parameters for getSynthesizeSpeechUrl
        var speechParams = {
            OutputFormat: "mp3",
            SampleRate: "16000",
            Text: "Bus " + busNumber + " has arrived!",
            TextType: "text",
            VoiceId: "Joanna"
        };
        //speechParams.Text = document.getElementById("textEntry").value;

        // Create the Polly service object and presigner object
        var polly = new AWS.Polly({ apiVersion: '2016-06-10' });
        var signer = new AWS.Polly.Presigner(speechParams, polly)

        // Create presigned URL of synthesized speech file
        signer.getSynthesizeSpeechUrl(speechParams, function (error, url) {
            if (error) {
                document.getElementById('result').innerHTML = error;
            } else {
                document.getElementById('audioSource').src = url;
                document.getElementById('audioPlayback').load();
                document.getElementById('audioPlayback').play();
                playRaspPi(busNumber);
            }
        });
    }

    function retrieveRekognitionData(busNumber) {
        //remember to activate the model
        const AWS = require('aws-sdk');
        AWS.config.update({
            "accessKeyId": "AKIA4URMTOCRMV4F6A4X",
            "secretAccessKey": "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",
            "region": "ap-southeast-1"
        });
        var lambda = new AWS.Lambda();
        var params = {
            FunctionName: 'Bus-Number-cloud', /* required */
            Payload: null
        };
        lambda.invoke(params, function (err, data) {
            if (err)
                console.log(err, err.stack); // an error occurred
            else
                sendMessage(busNumber)
            receiveMessage()
            console.log(data);           // successful response
        });
    }

    function sendMessage(busNumber) {
        const AWS = require('aws-sdk');
        //AWS.config.loadFromPath('./config.json');
        AWS.config.update({
            "accessKeyId": "AKIA4URMTOCRMV4F6A4X",
            "secretAccessKey": "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",
            "region": "ap-southeast-1"
        });
        AWS.config.update({ region: 'ap-southeast-1' });

        const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
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
        AWS.config.update({
            "accessKeyId": "AKIA4URMTOCRMV4F6A4X",
            "secretAccessKey": "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",
            "region": "ap-southeast-1"
        });
        AWS.config.update({ region: 'ap-southeast-1' });

        const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
        const queueUrl = `https://sqs.ap-southeast-1.amazonaws.com/868750684322/Bus-SQSQueue`

        const params = {
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 10,
            VisibilityTimeout: 30,
            WaitTimeSeconds: 0
        };

        sqs.receiveMessage(params, function (err, data) {
            if (err) {
                console.log("Receive Error", err);
            } else if (data.Messages) {

                var deleteParams = {
                    QueueUrl: queueUrl,
                    ReceiptHandle: data.Messages[0].ReceiptHandle
                };

                var obj = JSON.parse(data.Messages[0].Body);
                let msg = (obj['arrival_msg']).toString();

                sqs.deleteMessage(deleteParams, function (err, data) {
                    if (err) {
                        console.log("Delete Error", err);
                    } else {
                        console.log("Message Deleted", data);
                    }
                });
                localStorage.setItem('showMessage', msg);
            }
        });
    }

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
                    <audio id="audioPlayback" autoplay crossorigin="anonymous">
                        <source id="audioSource" src=""></source>
                    </audio>
                    <br></br>
                    {formSuccess && <label className="label">{busMsg}</label>}
                    {busComes && <label className="label">{showMessage}</label>}
                </div>
            </section>
        </>
    )
}

export default BusArrival
import { useState } from "react"
import Hero from "../components/Global/Hero"
//import { playRaspPi } from "../pages/BusArrivalAlert"
import { Reload } from '@rsuite/icons';
//INCLUDE POLLING TO KEEP RETRIEVING THE NEW UPDATE ON BUS ARRIVAL

const BusArrival = () => {
    const [formSuccess, setFormSuccess] = useState(null) //on the way
    const [busNumber, setbusNumber] = useState("");//input
    const busMsg = "On the way..."
    const [busComes, setArrivalSuccess] = useState(null)//arrived
    const showMessage = localStorage.getItem('showMessage');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(busNumber);
        setTimeout(runPolling(busNumber), 5000);

        //REMOVE COMMENT TAGS TO TEST WITH DEEPLENS
        function runPolling(busNumber) {
            const AWS = require('aws-sdk');
            //AWS.config.loadFromPath('./config.json');
            AWS.config.update({
                "accessKeyId": "AKIA4URMTOCRMV4F6A4X",
                "secretAccessKey": "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",
                "region": "ap-northeast-1"
            });
            AWS.config.update({ region: 'ap-northeast-1' });

            const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
            const queueUrl = `https://sqs.ap-northeast-1.amazonaws.com/868750684322/Payload-SQSQueue`

            const params = {
                QueueUrl: queueUrl,
                MaxNumberOfMessages: 10,
                VisibilityTimeout: 0,
                WaitTimeSeconds: 0
            };

            sqs.receiveMessage(params, function (err, data) {

                if (err) {
                    console.log("Receive Error", err);
                } else if (data.Messages) {

                    //setFormSuccess(true)

                    var obj = JSON.parse(data.Messages[0].Body)
                    var payload = obj['responsePayload']

                    if (payload.includes(busNumber)) {
                        var deleteParams = {
                            QueueUrl: queueUrl,
                            ReceiptHandle: data.Messages[0].ReceiptHandle
                        };
                        sqs.deleteMessage(deleteParams, function (err, data) {
                            if (err) {
                                console.log("Delete Error", err);
                            } else {
                                setArrivalSuccess(true)
                                speakText(busNumber)
                                sendMessage(busNumber)
                                receiveMessage()
                                //setFormSuccess(false)
                                // successful response
                                console.log("Message Deleted", data);
                            }
                        });
                    }
                    else {
                        setArrivalSuccess(false)
                        setFormSuccess(true)
                        //setTimeout(runPolling(busNumber), 10000);
                    }
                }
            });
        }
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
                //playRaspPi(busNumber);
            }
        });
    }

    //function receivePayload() {
    //     const AWS = require('aws-sdk');
    //     //AWS.config.loadFromPath('./config.json');
    //     AWS.config.update({
    //         "accessKeyId": "AKIA4URMTOCRMV4F6A4X",
    //         "secretAccessKey": "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",
    //         "region": "ap-northeast-1"
    //     });
    //     AWS.config.update({ region: 'ap-northeast-1' });

    //     const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
    //     const queueUrl = `https://sqs.ap-northeast-1.amazonaws.com/868750684322/Payload-SQSQueue`

    //     const params = {
    //         QueueUrl: queueUrl,
    //         MaxNumberOfMessages: 10,
    //         VisibilityTimeout: 30,
    //         WaitTimeSeconds: 0
    //     };

    //     sqs.receiveMessage(params, function (err, data) {

    //         if (err) {
    //             console.log("Receive Error", err);
    //         } else if (data.Messages) {

    //             var deleteParams = {
    //                 QueueUrl: queueUrl,
    //                 ReceiptHandle: data.Messages[0].ReceiptHandle
    //             };

    //             var obj = JSON.parse(data.Messages[0].Body)
    //             console.log(obj['responsePayload'])

    //             sqs.deleteMessage(deleteParams, function (err, data) {
    //                 if (err) {
    //                     console.log("Delete Error", err);
    //                 } else {
    //                     console.log("Message Deleted", data);
    //                 }
    //             });
    //         }
    //     });
    // }

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
                arrival_msg: "The bus has arrived!",
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

    const emojiStyles = {
        marginLeft: 3.2 + 2 + 'rem',
        fontSize: Math.random() > 0.5 ? '75px' : '75px',
        padding: '20px',
        backgroundColor: 'white',
        color: 'white',
    };
    const bStyles = {
        marginLeft: 3 + 3.5 + 'rem',
        fontSize: Math.random() > 0.5 ? '25px' : '25px',
    };
    const bStyles2 = {
        marginLeft: 1 + 2 + 'rem',
    };
    const bStyles3 = {
        marginLeft: 1 + 1 + 'rem',
        marginTop: 1 + 1 + 'rem',
        marginRight: 0.1 + 0.1 + 'rem',
        backgroundColor: 'white',
        borderRadius: 15,
        fontSize: '15px'
    };
    const bStyles4 = {
        borderRadius: 5,
        border: 'none',
        backgroundColor: '#4CAF50',
        color: 'white',
        outline: 'none',
        fontSize: '17px'
    };
    const bStyles5 = {
        marginLeft: 3 + 2.5 + 'rem',
        fontSize: '23px'
    };
    const bStyles6 = {
        marginLeft: 0.5 + 2.5 + 'rem',
        fontSize: '23px'
    };

    return (
        <>
            <Hero title="Wait for bus" subtitle="Know when your bus arrives effortlessly" size="" returnHomeBtn={true} />
            <section className="section">
                <div className="container">

                    <div>
                        <span role="img" style={emojiStyles} stylearia-label="smileyface">😊</span><br></br><b style={bStyles}>Hi User!</b><br></br><p style={bStyles2}>Please input your bus number.</p>
                    </div>

                    <div>
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="stopID"></label>
                            <input style={bStyles3} type="text" name='busName' onChange={e => setbusNumber(e.target.value)}></input>
                            <button style={bStyles4} type="submit">Submit</button>
                        </form>
                    </div>
                    <br></br>
                    <audio id="audioPlayback">
                        <source id="audioSource" src=""></source>
                    </audio>
                    <Reload spin
                        style={{ marginLeft: 6 + 2.5 + 'rem', fontSize: '2em' }}
                        color="black" />
                    <div>
                        <span role="img" style={emojiStyles} stylearia-label="smileyface">🚌</span>
                    </div>
                    {formSuccess && <label style={bStyles5} className="label">{busMsg}</label>}
                    {busComes && <label style={bStyles6} className="label">{showMessage}</label>}
                </div>
            </section>
        </>
    )
}

export default BusArrival
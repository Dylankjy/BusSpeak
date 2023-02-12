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
        Text: "Bus "+ busNumber +" has arrived! Bus "+ busNumber +" has arrived! Bus "+ busNumber +" has arrived!",
        TextType: "text",
        VoiceId: "Joanna"
     }
    var Polly = new AWS.Polly({apiVersion: '2016-06-10'});
    var speak = function(text) {
        speechParams2.Text = text;
        Polly.synthesizeSpeech(speechParams2, function(err, res) {
            if (err) {
                console.log('err', err)
            } else if (res && res.AudioStream instanceof Buffer) {
                var bufferStream = new Stream.PassThrough()
                bufferStream.end(res.AudioStream)
                bufferStream.pipe(getPlayer());
            }
        })
    }
}

// module.exports = { Speak: speak };
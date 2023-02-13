import React, { Component } from "react"
import '../App.css'

class KommunicateChat extends Component {
    constructor(props){
        super(props);
    }

    componentDidMount(){
        (function(d, m){
            var kommunicateSettings = {
                "appId":"3b5948eb6aaaa527be55a95c7f8686137",
                "popupWidget":true,
                "automaticChatOpenOnNavigation":true,
                "attachment": false,
                "locShare": true,
                "restartConversationByUser": true,
                "voiceInput": true,
                "voiceOutput": true
                };
            var s = document.createElement("script"); s.type = "text/javascript"; s.async = true;
            s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
            var h = document.getElementsByTagName("head")[0]; h.appendChild(s);
            window.kommunicate = m; m._globals = kommunicateSettings;
          })(document, window.kommunicate || {});
    }

    render(){
        return (
            <div>
            </div>
        )
    }
}

export default KommunicateChat;
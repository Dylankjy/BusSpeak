import { Link } from "react-router-dom"

const LocationPrompt = ({ onClose }) => {
    return (
        <div className="modal is-active">
            <div className="modal-background" />
            <div className="modal-content">
                <div className="card">
                    <div className="card-content">
                        <h1 className="title"><i className="fa-solid fa-location-dot has-text-danger-dark"></i>&ensp;Find your stop easily</h1>
                        <p className="subtitle">BusSpeak requests access to your current location in order to detect nearby bus stops</p>
                        <p>Please press 'accept' when prompted by your device.</p>

                        <p>If you decline and change your mind in the future, you will need to do so in your browser settings.</p>

                        <div className="buttons mt-5 is-right">
                            <Link to="/" className="button is-white">Return to home</Link>
                            <button to="/" className="button is-dark" onClick={onClose}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LocationPrompt

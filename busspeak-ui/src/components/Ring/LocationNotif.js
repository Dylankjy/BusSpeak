import { useEffect, useState } from "react"

const LocationNotif = ({ location, lastUpdate }) => {
    const isLocationLoaded = () => {
        return location.lat !== null && location.long !== null
    }

    const [lastUpdateText, setLastUpdateText] = useState('')

    // Parse last update time, show x seconds ago
    const parseLastUpdate = () => {
        lastUpdate = new Date(lastUpdate)
        if (lastUpdate === null) {
            return "never"
        }

        const seconds = Math.floor((new Date() - lastUpdate) / 1000)
        if (seconds < 60) {
            return `${seconds} seconds ago`
        }

        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) {
            return `${minutes}min(s) ago`
        }

        return 'long time ago'
    }

    setTimeout(() => {
        setLastUpdateText(parseLastUpdate())
    }, 1000);

    if (isLocationLoaded()) {
        return (
            <div className="notification is-info">
                <div className="level">
                    <div className="level-left">
                        <div className="level-item">
                            <strong><i className="fa-solid fa-location-arrow"></i>&ensp;Location updating in realtime</strong>
                        </div>
                    </div>
                    <div className="level-right">
                        <div className="level-item">
                            <p>{lastUpdateText}</p>
                        </div>  
                    </div>
                </div>
                
                
            </div>
        )
    }

    return (
        <div className="notification is-danger is-light">
            <strong><i className="fa-solid fa-times"></i>&ensp;Location detection disabled</strong>
        </div>
    )
}

export default LocationNotif

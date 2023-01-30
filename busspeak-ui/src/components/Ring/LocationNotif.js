const LocationNotif = ({ location }) => {
    const isLocationLoaded = () => {
        return location.lat !== null && location.long !== null
    }

    if (isLocationLoaded()) {
        return (
            <div className="notification is-success is-light">
                <strong><i className="fa-solid fa-location-arrow"></i>&ensp;Location service is active. Updating automatically...</strong>
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

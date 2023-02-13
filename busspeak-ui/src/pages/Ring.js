import { useEffect, useState } from "react"
import Hero from "../components/Global/Hero"
import LocationNotif from "../components/Ring/LocationNotif"
import LocationPrompt from "../components/Ring/LocationPrompt"

import axios from "axios"

import LocatingLoading from "../components/Ring/Locating"
import StopInfoModal from "../components/Ring/partials/StopInfoModal"
import { useSearchParams } from "react-router-dom"

const Ring = () => {
    const [userLocation, setUserLocation] = useState({
        lat: null,
        long: null
    })
    const [lastLocationUpdate, setLastLocationUpdate] = useState(null)

    const [showLocatonPrompt, setShowLocationPrompt] = useState(false)
    const [nearbyStops, setNearbyStops] = useState([])
    const [nearbyLocation, setNearbyLocations] = useState(null)

    // For handling preselected stop given by bot.
    const [searchParams] = useSearchParams()
    const [prefillStop] = useState(searchParams.get('stop'))

    useEffect(() => {
        let locationWatch = null
        if (navigator.geolocation) {
            console.debug("Location info pending");
            setShowLocationPrompt(true)

            // Get initial location
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    long: position.coords.longitude
                })
                setShowLocationPrompt(false)

                console.debug("Location info available");
            })

            // Get location updates
            locationWatch = navigator.geolocation.watchPosition((position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    long: position.coords.longitude
                })
                setLastLocationUpdate((new Date()).toISOString())
            })

        } else {
            console.debug("Location info unavailable")
        }

        // Handle pre-fill stops
        if (prefillStop) {
            console.log('Prefill stop was given')
            toggleStopInfoModal(prefillStop)
        }

        return () => {
            navigator.geolocation.clearWatch(locationWatch)
        }
    }, [])

    const getStopInfo = async (stopID) => {
        const res = await axios({
            method: "post",
            url: "https://gfegn6mkia.execute-api.ap-southeast-1.amazonaws.com/geo/get_stop",
            data: {
                stopID: stopID
            },
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
            }
        })

        return res.data
    }

    // Whenever location updates, fetch nearby stops from Google Maps API
    useEffect(() => {
        console.log('Location was updated')
        const getBusStopList = async () => {
            const res = await axios({
                method: "post",
                url: "https://gfegn6mkia.execute-api.ap-southeast-1.amazonaws.com/geo/nearby_busstops",
                data: {
                    location: userLocation
                },
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                }
            })

            // Remove duplicates
            const uniqueStops = [...new Map(res.data.result.map(item => [item['code'], item])).values()]

            setNearbyStops(uniqueStops)
            setNearbyLocations(res.data.nearbyLocation)
            return res.data
        }

        if (userLocation.lat !== null && userLocation.long !== null) {
            console.debug("Location info was updated")
            console.table(userLocation)

            // Fetch nearby stops
            getBusStopList()
        }
    }, [userLocation])

    const [stopInfoModalData, setStopInfoModalData] = useState({})
    const [showStopInfoModal, setShowStopInfoModal] = useState(false)

    const toggleStopInfoModal = async (stopID) => {
        setShowStopInfoModal(true)
        getStopInfo(stopID).then((stopInfo) => {
            setStopInfoModalData(stopInfo)
        })
    }

    const onStopInfoModalClose = () => {
        setShowStopInfoModal(false)
        setStopInfoModalData({})
    }

    return (
        <>
            <Hero title="Ring for me" subtitle="Play a jingle to know that you're at the right stop" size="" returnHomeBtn={true} extraElement={<LocationNotif location={userLocation} lastUpdate={lastLocationUpdate} />} />
            {(nearbyStops.length === 0) && <LocatingLoading />}

            { (nearbyStops.length !== 0) &&
            <section className="section">
                <div className="container">
                    <h1 className="title">You are currently near {nearbyLocation}</h1>
                    <p className="subtitle">Showing bus stops within a 500m radius</p>

                    <p className="mb-5 is-size-5"><i className="fa-solid fa-bell"></i>&ensp;Click on the Bus Stop you wish to play a jingle at.</p>

                    <div className="columns is-multiline">
                        {nearbyStops.map((stop) => {
                            return (
                                <div className="column is-4" key={stop._id}>
                                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                    <a className="box" onClick={() => toggleStopInfoModal(stop._id)}>
                                        <p className="is-size-5 has-text-weight-bold">
                                            {stop.stopName}
                                        </p>
                                        <p className="subtitle">{stop._id}</p>
                                        <p className="has-text-grey"><i className="fa-solid fa-road"></i>&ensp;{stop.location.road}</p>
                                    </a>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>
            }

            {showStopInfoModal && <StopInfoModal data={stopInfoModalData} onClose={onStopInfoModalClose} />}
            {showLocatonPrompt && <LocationPrompt onClose={() => { setShowLocationPrompt(false) }} />}
        </>
    )
}

export default Ring

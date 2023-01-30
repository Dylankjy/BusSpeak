import { useEffect, useState } from "react"
import Hero from "../components/Global/Hero"
import LocationNotif from "../components/Ring/LocationNotif"
import LocationPrompt from "../components/Ring/LocationPrompt"

import axios from "axios"

import { useFormik } from 'formik';

const Ring = () => {
    const [userLocation, setUserLocation] = useState({
        lat: null,
        long: null
    })

    const [showLocatonPrompt, setShowLocationPrompt] = useState(false)
    const [nearbyStops, setNearbyStops] = useState([])

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
            })

        } else {
            console.debug("Location info unavailable")
        }

        return () => {
            navigator.geolocation.clearWatch(locationWatch)
        }
    }, [])

    // Whenever location updates, fetch nearby stops from Google Maps API
    useEffect(() => {
        const getBusStopList = async () => {
            const res = await axios({
                method: "post",
                url: "https://gfegn6mkia.execute-api.ap-southeast-1.amazonaws.com/geo/nearby_busstops",
                data: {
                    location: {
                        "lat": 1.3966562187311518,
                        "long": 103.74432968189477
                    }
                },
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                }
            })
            setNearbyStops(res.data.result)
            return res.data
        }

        if (userLocation.lat !== null && userLocation.long !== null) {
            console.debug("Location info was updated")
            console.table(userLocation)
            
            getBusStopList()
        }
    }, [userLocation])

    const formInitialValues = {
        stopID: '15159'
    }
    const formik = useFormik({
        initialValues: formInitialValues,
        onSubmit: (values, { resetForm }) => {
            const res = axios.post('https://gfegn6mkia.execute-api.ap-southeast-1.amazonaws.com/melody/play', { stopID: parseInt(formik.values.stopID) })
            console.log(res.data)
            resetForm()
        },
    });


    return (
        <>
            <Hero title="Ring for me" subtitle="Play a jingle to know that you're at the right stop" size="" returnHomeBtn={true} />
            <section className="section">
                <div className="container">
                    <LocationNotif location={userLocation} />

                    <div>
                        <b>Current coords</b>
                        <p>{userLocation.lat}</p>
                        <p>{userLocation.long}</p>
                    </div>

                    <div>
                        <b>Bus stops nearby</b>
                        <ul>
                            {nearbyStops.map((stop) => {
                                return <li key={stop._id}>{stop.stopName} ({stop.code})</li>
                            })}
                        </ul>
                    </div>

                    <div>
                        <form onSubmit={formik.handleSubmit}>
                            <label htmlFor="stopID">Enter stop ID</label>
                            <input
                                id="stopID"
                                name="stopID"
                                type="text"
                                onChange={formik.handleChange}
                                value={formik.values.stopID}
                            />
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            </section>
            {showLocatonPrompt && <LocationPrompt onClose={() => { setShowLocationPrompt(false) }} />}
        </>
    )
}

export default Ring

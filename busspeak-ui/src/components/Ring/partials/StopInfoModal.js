import { useEffect, useState } from "react"
import axios from "axios"

const StopInfoModal = ({ data, onClose }) => {

    const [isPlayable, setIsPlayable] = useState(true)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        console.log(isPlayable)
        if ('info' in data) {
            console.log(isPlayable)
            setIsLoaded(true)
        }
    })

    const playMelody = () => {
        axios.post('https://gfegn6mkia.execute-api.ap-southeast-1.amazonaws.com/melody/play', { stopID: parseInt(data.info.code) })

        setIsPlayable(false)

        setTimeout(() => {
            setIsPlayable(true)
        }, 10000)
    }

    return (
        <div className="modal is-active">
            <div className="modal-background" />
            <div className="modal-content">
                <div className="card">
                    {(!isLoaded) ? (
                    <div className="card-content">
                        <div className="has-text-centered">
                            <span className="loader mt-6"></span>
                            <p className="mt-3 has-text-weight-bold has-text-dark is-size-5 mb-6">Loading stop info</p>
                        </div>
                    </div>
                    ) : (
                    <div className="card-content">
                        <div className={(!isPlayable) ? 'card-content-centered is-active' : 'card-content-centered'}>
                            <div className="has-text-centered">
                                <span className="loader"></span>
                                <p className="mt-3 has-text-weight-bold has-text-dark is-size-5">Playing jingle at stop</p>
                            </div>
                        </div>
                        <div className={(!isPlayable) ? 'is-blurred card-content-busstop-info' : 'card-content-busstop-info'}>
                            <h2 className="title">{data.info.stopName}</h2>
                            <p className="subtitle">{data.info.code} - {data.info.location.road}</p>

                            <div>
                                <div className="tags">
                                    {data.routes.map((route) => {
                                        return (
                                            <span key={route.service.service} className="tag is-medium is-bus-number">{route.service.service}</span>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="buttons mt-5 is-right">
                                <button className="button is-white" onClick={onClose} disabled={(!isLoaded) ? true : false}>Close</button>
                                <button className="button is-dark" onClick={playMelody}>Play Jingle</button>
                            </div>
                        </div>
                    </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StopInfoModal

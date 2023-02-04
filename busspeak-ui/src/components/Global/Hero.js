import { Link } from "react-router-dom"

const Hero = ({ title, subtitle, extraElement, size = 'is-medium', returnHomeBtn = false }) => (
    <section className={`section has-background-black ${size}`}>
        <div className="container">
            {returnHomeBtn && <p className="mb-5"><Link className="has-text-grey-light" to={'/'}><i className="fa-solid fa-arrow-left"></i>&ensp;Back</Link></p>}
            <h1 className="title has-text-white">{title}</h1>
            <p className="subtitle has-text-grey-light">{subtitle}</p>
            {extraElement}
        </div>
    </section>
)

export default Hero

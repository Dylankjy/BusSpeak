const Hero = ({ title, subtitle }) => (
    <section className="section has-background-black is-medium">
        <div className="container">
            <h1 className="title has-text-white">{title}</h1>
            <p className="subtitle has-text-grey-light">{subtitle}</p>
        </div>
    </section>
)

export default Hero

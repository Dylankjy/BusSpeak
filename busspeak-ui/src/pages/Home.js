import PageSelect from "../components/Home/PageSelect";

const { default: Hero } = require("../components/Global/Hero");

const Home = () => (
    <>
        <Hero title="BusSpeak" subtitle="Universal access at Bus Stops for all." />
        <PageSelect />
    </>
)

export default Home

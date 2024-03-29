import GotoPageButton from "./GotoPageButton"

const PageSelect = () => (
    <section className="section">
        <div className="container">
            <div className="columns is-multiline">
                <div className="column is-half">
                    <GotoPageButton faIcon="volume-high" text="Ring for me" desc="Play a jingle to know that you're at the right stop" link={'/ring'} />
                </div>
                <div className="column is-half">
                    <GotoPageButton faIcon="bus" text="Wait for bus" desc="Know when your bus arrives effortlessly" link={'/busarrival'} />
                </div>
                {/* <div className="column is-half">
                    <GotoPageButton />
                </div> */}
            </div>
        </div>
    </section>
)

export default PageSelect
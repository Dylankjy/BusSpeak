import { Link } from "react-router-dom"

const GotoPageButton = ({ faIcon, text, desc, link }) => (
    <Link className="box" to={link}>
        <div className="level">
            <div className="level-left">
                <div className="level-item">
                    <span className="icon is-large">
                        <i className={`fas fa-${faIcon} fa-2x`}></i>
                    </span>
                </div>

                <div className="level-item">
                    <div>
                        <p className="title is-4">{text}</p>
                        <p className="subtitle mt-0">{desc}</p>
                    </div>
                </div>
            </div>
        </div>
    </Link>
)

export default GotoPageButton

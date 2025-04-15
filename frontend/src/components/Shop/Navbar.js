import { Link } from "react-router-dom"
import "./Navbar.css"

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-title">Shop</h1>
        <Link to="/account" className="account-button">
          <div className="account-circle">
            <span>A</span>
          </div>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar


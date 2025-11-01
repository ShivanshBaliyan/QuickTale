import { Link , Outlet, useNavigate } from "react-router-dom"
import logo from "../images/logo.png"
import { useContext, useState } from "react"
import { UserContext } from "../App"
import { UserNavigationPanel } from "./index"

function Navbar() {
  const [ searchBoxVisibility, setSearchBoxVisibility ] = useState(false)
  const [ userNavPanel, setUserNavPanel ] = useState(false);

  let navigate = useNavigate();

  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const profile_img = userAuth?.profile_img;

  const handleUserNavPanel = () => {
    setUserNavPanel(currVal => !currVal);
  }

  const handleSearch = (e) => {
    let query = e.target.value;

    if(e.keyCode == 13 && query.length) {
      navigate(`/search/${query}`)
    }
  }

  const handleBlur = () => {
    setTimeout(() => {
      setUserNavPanel(false);
    }, 200)
  }

  return (
    <>
    <nav className="navbar z-50">

      <Link to="/" className="flex-none w-10">
        <img src={logo} alt="logo image" className="w-full" />
      </Link>

      {/* Search Bar */}
      <div
        className={`absolute bg-white w-full left-0 top-full mt-0 py-5 px-[5vw] md:block md:relative md:inset-0 md:p-0 md:w-auto ${ searchBoxVisibility ? "block" : "hidden"}`}
        role="search"
      >
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search"
            aria-label="Search"
            className="w-full bg-gray-200 p-4 pl-6 pr-12 md:pr-6 rounded-full placeholder:text-gray-800 md:pl-12"
            onKeyDown={handleSearch}
          />
          <i className="fa-solid fa-magnifying-glass absolute right-4 md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-gray-600"></i>
        </div>
      </div>

    
      <div className="flex items-center gap-3 ml-auto">

        {/* Button for Search Bar  */}
        <button
          className="md:hidden bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center hover:outline-2 hover:outline-black" 
          onClick={() => setSearchBoxVisibility(currVal => !currVal)}
        >
          <i className="fa-solid fa-magnifying-glass text-xl"></i>
        </button>

        {/* Write option */}
        <Link to="/editor" 
        className="hidden md:flex items-center gap-2 text-gray-900 hover:text-black hover:bg-gray-300 py-3 px-6 opacity-75 text-lg rounded-full hover:outline-2 hover:outline-black"
        >
          <i className="fa-solid fa-file-pen pt-1.5"></i>
          <span>Write</span>
        </Link>

        {
          access_token ? 
            <>
              <Link to="/dashboard/notification">
                <button className="h-12 w-12 bg-gray-300 rounded-full relative hover:bg-black/10">
                  <i className="fa-regular fa-bell text-2xl block mt-1"></i>
                </button>
              </Link> 

              <div className="relative" onClick={handleUserNavPanel} onBlur={handleBlur}>
                <button className="w-12 h-12 mt-1">
                  <img src={profile_img} alt="Profile" className="w-full h-full object-cover rounded-full" />
                </button>

                {
                  userNavPanel ? <UserNavigationPanel />
                  : ""
                }

              </div>
            </>
          : 
            <>

              {/* Sign In */}
              <Link to="/signin" className="btn-dark">
                Sign In
              </Link>

              {/* Sign Up */}
              <Link to="/signup" className="btn-light">
                Sign Up
              </Link>

            </>
        }
        
      </div>
    </nav>
    
    <Outlet />
    </>
  )
}

export default Navbar

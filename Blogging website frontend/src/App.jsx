import { Navbar } from "./components/index"
import { Route, Routes } from "react-router-dom"
import { UserAuthForm } from "./pages/pages.js"
import { createContext, useEffect, useState } from "react"
import { lookInSession } from "./common/common.js"

export const UserContext = createContext({});

function App() {

  const [userAuth , setUserAuth] = useState();

  useEffect(() => {
    let userInSession = lookInSession("user");

    userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null});

  }, [])

  return (
    <>
      <UserContext.Provider value={{userAuth, setUserAuth}}>
        <Routes>
          <Route path="/" element={<Navbar />}>
            <Route path="signin" element={<UserAuthForm type="sign-in"/>} />
            <Route path="signup" element={<UserAuthForm type="sign-up"/>} />
          </Route>
        </Routes>
      </UserContext.Provider>
    </>
  )
}

export default App

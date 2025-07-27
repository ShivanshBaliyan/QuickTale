import { Route, Routes } from "react-router-dom"
import { createContext, useEffect, useState } from "react"
import { lookInSession } from "./common/common.js"
import { Navbar } from "./components/index"
import { Editor, UserAuthForm } from "./pages/pages.js"

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
          <Route path="/editor" element={<Editor />} />
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

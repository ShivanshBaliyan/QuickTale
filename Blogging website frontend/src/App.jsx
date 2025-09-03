import { Route, Routes, useParams } from "react-router-dom"
import { createContext, useEffect, useState } from "react"
import { lookInSession } from "./common/common.js"
import { Navbar } from "./components/index"
import { Editor, UserAuthForm, HomePage, SearchPage, PageNotFound, ProfilePage } from "./pages/pages.js"

export const UserContext = createContext({});

function App() {

  const [userAuth , setUserAuth] = useState();

  useEffect(() => {
    let userInSession = lookInSession("user");

    userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null});

  }, [])

  // simple inline Blog detail placeholder so /blog/:id resolves
  const BlogDetail = () => {
    const { id } = useParams();
    return <div className="p-8">Blog detail: {id}</div>;
  };

  return (
    <>
      <UserContext.Provider value={{userAuth, setUserAuth}}>
        <Routes>
          <Route path="/editor" element={<Editor />} />
          <Route path="/" element={<Navbar />}>
            <Route index element={<HomePage />} />
            <Route path="signin" element={<UserAuthForm type="sign-in"/>} />
            <Route path="signup" element={<UserAuthForm type="sign-up"/>} />

            {/* added route to match /blog/:id and prevent "No routes matched" */}
            <Route path="blog/:id" element={<BlogDetail />} />
            <Route path="search/:query" element={<SearchPage />} />
            <Route path="user/:id" element={<ProfilePage />} />

            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </UserContext.Provider>
    </>
  )
}

export default App

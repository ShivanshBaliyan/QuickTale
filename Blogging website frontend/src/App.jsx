import { Route, Routes, useParams } from "react-router-dom"
import { createContext, useEffect, useState } from "react"
import { lookInSession } from "./common/common.js"
import { Navbar, SideNav } from "./components/index"
import { Editor, UserAuthForm, HomePage, SearchPage, PageNotFound, ProfilePage, BlogPage, ChangePassword, EditProfile, Notifications } from "./pages/pages.js"

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
          <Route path="/editor/:blog_id" element={<Editor />} />
          <Route path="/" element={<Navbar />}>
            <Route index element={<HomePage />} />

            <Route path="dashboard" element={<SideNav />} >
              <Route path="notifications" element={<Notifications />} />
            </Route>

            <Route path="settings" element={<SideNav />} >
              <Route path="edit-profile" element={<EditProfile />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>

            <Route path="signin" element={<UserAuthForm type="sign-in"/>} />
            <Route path="signup" element={<UserAuthForm type="sign-up"/>} />
            <Route path="search/:query" element={<SearchPage />} />
            <Route path="user/:id" element={<ProfilePage />} />
            <Route path="blog/:blog_id" element={<BlogPage />} />

            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </UserContext.Provider>
    </>
  )
}

export default App

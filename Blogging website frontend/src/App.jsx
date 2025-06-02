import { Navbar } from "./components/index"
import { Route, Routes } from "react-router-dom"
import { UserAuthForm } from "./pages/pages.js"

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route path="signin" element={<UserAuthForm type="sign-in"/>} />
          <Route path="signup" element={<UserAuthForm type="sign-up"/>} />
        </Route>
      </Routes>
    </>
  )
}

export default App

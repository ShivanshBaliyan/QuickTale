import { InputBox } from "../../components/index"
import googleIcon from '../../images/google.png'
import { Link } from "react-router-dom"
import { AnimationWrapper } from '../../common/common'
import { useRef } from "react"


const UserAuthForm = ({ type }) => {

  const authForm = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();

    let form = new FormData(authForm.current);
    let formData = {};

    for(let[key, value] of form.entries()) {
      formData[key] = value;
    }

    let { fullname, email, password } = formData

    // validations
    // Fullname validation
    if (!fullname || typeof fullname !== "string") {
      return res.status(400).json({ error: "Fullname is required" });
    }
    if (fullname.trim().length < 3) {
      return res.status(400).json({ error: "Fullname must be at least 3 letters long" });
    }

    // Email validation
    if (!email || typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({ error: "Email is required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    // Password validation
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Password is required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

  }

  return (
    <>
      <AnimationWrapper keyValue={type}>
        <section className="h-cover flex items-center justify-center">
          <form ref={authForm} className="w-[80%] max-w-[400px]">
              <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                  {type == "sign-in" ? "Welcome Back" : "Join us today"}
              </h1> 

              {
                type != "sign-in" ? 
                  <InputBox
                    name="fullname"
                    type="text"
                    placeholder="Full Name"
                    icon="user"
                  />
                : ""
              }

              <InputBox
                name="email"
                type="email"
                placeholder="Email"
                icon="envelope"
              />

              <InputBox
                name="password"
                type="password"
                placeholder="Password"
                icon="key"
              />

              <button 
                className="btn-dark center mt-14"
                type="submit"
                onClick={handleSubmit}
              >
                { type.replace("-", " ") }
              </button>

              <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                <hr className="w-1/2 border-black"/>
                or
                <hr className="w-1/2 border-black"/>
              </div>

              <div className="flex items-center justify-center">
                <button className="btn-dark flex items-center justify-center gap-4">
                  <img src={googleIcon} className="w-5" />
                  Continue with Google
                </button>
              </div>

              {
                type == "sign-in" ?
                <p className="mt-6 text-gray-600 text-xl text-center">
                  Don't have an account ?
                  <Link to="/signup" className="underline text-black text-xl ml-1">
                    Join us today
                  </Link>
                </p>
                :
                <p className="mt-6 text-gray-600 text-xl text-center">
                  Already a member ?
                  <Link to="/signin" className="underline text-black text-xl ml-1">
                    Sign in here.
                  </Link>
                </p>
              }

          </form>

        </section>
      </AnimationWrapper>
    </>
  )
}

export default UserAuthForm

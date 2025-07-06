import { InputBox } from "../components/index"
import googleIcon from '../images/google.png'
import { Link, Navigate } from "react-router-dom"
import { AnimationWrapper, storeInSession } from '../common/common'
import { Toaster, toast } from "react-hot-toast";
import axios from "axios"
import { useContext } from "react";
import { UserContext } from "../App";


const UserAuthForm = ({ type }) => {

  const { userAuth, setUserAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;

  const UserAuthThroughServer = (serverRoute, formData) => {

    axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute , formData)
    .then(({ data}) => {
      storeInSession("user", JSON.stringify(data));
      setUserAuth(data);
    })
    .catch(({ response }) => {
      toast.error(response.data.error)
    })

  }

  const handleSubmit = (e) => {
    e.preventDefault();

    let serverRoute = type == "sign-in" ? "/signin" : "/signup";

    let form = new FormData(formElement);
    let formData = {};

    for(let[key, value] of form.entries()) {
      formData[key] = value;
    }

    let { fullname, email, password } = formData

    // validations
    // Fullname validation
    if (fullname) {
      if (fullname.trim().length < 3) {
        return toast.error("Fullname must be at least 3 letters long" );
    }
    }

    // Email validation
    if (!email || typeof email !== "string" || email.trim() === "") {
      return toast.error("Email is required" );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error("Please provide a valid email address" );
    }

    // Password validation
    if (!password || typeof password !== "string") {
      return toast.error("Password is required" );
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long" );
    }

    UserAuthThroughServer(serverRoute, formData);  

  }

  return (
    <>
      {access_token ? (
        <Navigate to="/" /> 
      ) : (
        <AnimationWrapper keyValue={type}>
          <section className="h-cover flex items-center justify-center">
            <Toaster />
            <form id="formElement" className="w-[80%] max-w-[400px]">
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
      )}
    </>
  )
}

export default UserAuthForm

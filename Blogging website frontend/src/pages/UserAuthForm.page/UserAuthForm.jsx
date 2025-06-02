import { InputBox } from "../../components/index"
import googleIcon from '../../images/google.png'
import { Link } from "react-router-dom"
import { AnimationWrapper } from '../../common/common'


const UserAuthForm = ({ type }) => {
  return (
    <>
      <AnimationWrapper keyValue={type}>
        <section className="h-cover flex items-center justify-center">
          <form className="w-[80%] max-w-[400px]">
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

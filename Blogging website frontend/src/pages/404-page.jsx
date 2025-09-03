import { Link } from "react-router-dom";
import pageNotFoundImage from "../images/404.png";
import fullLogo from "../images/fullLogo.png"

const PageNotFound = () => {
  return (
    <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center" >

        <img src={pageNotFoundImage} className="select-none border-2 border-gray-200 !w-72 aspect-square object-cover rounded" />

        <h1 className="text-4xl font-gelasio leading-7">Page Not Found</h1>
        <p className="text-gray-600 text-xl leading-7 !-mt-8">The page you are looking for does not exist. Head back to the <Link to="/" className="text-black underline">home page</Link></p>

        <div className="mt-auto">
            <img src={fullLogo} className="!h-16 object-contain block mx-auto select-none" />
            <p className="!mt-5 text-gray-600">Read millions of tales around the world</p>
        </div>

    </section>
  )
}

export default PageNotFound;
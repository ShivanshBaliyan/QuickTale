import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { removeFromSession, AnimationWrapper } from "../common/common";

const UserNavigationPanel = () => {

    const { userAuth, setUserAuth } = useContext(UserContext);
    const username = userAuth?.username;

    const signOutUser = () => {
        removeFromSession("user");
        setUserAuth({ access_token: null });
    }

    return (
        <AnimationWrapper transition={{ duration: 0.2 }} className="absolute right-0 z-50">

            <div className="bg-white absolute right-0 border border-gray-200 e-60 overflow-hidden duration-200">

                <Link to="/editor" className="flex gap-2 link md:hidden pl-8 py-4">
                    <i className="fa-solid fa-file-pen pt-1.5"></i>
                    <span> Write</span>
                </Link>

                <Link to={`/user/${username}`} className="link pl-8 py-4">
                    Profile
                </Link>

                <Link to="/dashboard/blogs" className="link pl-8 py-4">
                    Dashboard
                </Link>

                <Link to="/settings/edit-profile" className="link pl-8 py-4">
                    Settings
                </Link>

                <span className="absolute border-t border-gray-300 w-[200%]">
                </span>

                <button className="text-left p-4 hover:bg-gray-200 w-full center py-4"
                    onClick={signOutUser}
                >
                    <h1 className="font-bold text-lg mg-1">Sign Out</h1>
                    <p className="text-gray-600">@{username}</p>
                </button>

            </div>

        </AnimationWrapper>
    )

}

export default UserNavigationPanel;
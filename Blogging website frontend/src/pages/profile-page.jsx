import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { AnimationWrapper } from "../common/common";
import { Loader } from "../components/index";
import { UserContext } from "../App";


export const profileDataStructure = {
    personal_info: {
        fullname: "",
        username: "",
        profile_img: "",
        bio: "",
    },
    account_info: {
        total_posts: 0,
        total_blogs: 0,
    },
    social_links: {},
    joinedAt: " "
}

const ProfilePage = () => {

    let { id: profileId } = useParams();
    let [ profile, setProfile ] = useState(profileDataStructure);
    let [ loading, setLoading ] = useState(true);

    const {
      personal_info = {},
      account_info = {},
      social_links = {},
      joinedAt = " "
    } = profile || {};

    const {
      fullname = "",
      username: profile_username = "",
      profile_img = "",
      bio = ""
    } = personal_info;

    const { total_posts = 0, total_reads = 0 } = account_info;

    let userContext = useContext(UserContext);
    let username = userContext?.userAuth?.username || null;

    const fetchUserProfile = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/get-profile', { username: profileId })
        .then(({ data }) => {
            // console.log("Profile data received:", data);
            const user = data.user || profileDataStructure;
            // console.log("User object:", user);
            setProfile(user);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error fetching user profile:", err);
            setProfile(profileDataStructure);
            setLoading(false);
        })
    }

    useEffect(() => {
        resetStates();
        fetchUserProfile();
    }, [profileId])

    const resetStates = () => {
        setProfile(profileDataStructure);
        setLoading(true);
    }    

    return (
        <AnimationWrapper>
            {
                loading ? <Loader /> :
                <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
                    <div className="flex flex-col max-md:items-center gap-5 min-w-[250px]">
                        {profile_img && <img src={profile_img} className="!w-48 !h-48 bg-gray-300 rounded-full md:w-32 md:h-32" />}

                        <h1 className="text-xl font-medium" >@{profile_username}</h1>
                        <p className="text-xl capitalize h-6">{fullname}</p>

                        <p>{total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} - Reads</p>

                        <div className="flex gap-4 mt-2">

                            {
                                profileId == username ? <Link to="/setting/edit-profile" className='btn-light rounded-md'>Edit Profile</Link> : null
                            }

                        </div>

                        {/* <AboutUser /> */}

                    </div>
                </section>
            }
        </AnimationWrapper>
    );
};

export default ProfilePage;


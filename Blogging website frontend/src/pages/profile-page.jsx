import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { AnimationWrapper, filterPaginationData } from "../common/common";
import { Loader, AboutUser, BlogPostCard, InPageNavigation, LoadMoreDataBtn, NoDataMessage } from "../components/index";
import { UserContext } from "../App";
import { PageNotFound } from "./pages.js";

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
    let [ blogs, setBlogs ] = useState(null);
    let [ profileLoaded, setProfileLoaded ] = useState("");

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
            if (!data.user) {
                setProfile(profileDataStructure);
                setLoading(false);
                return;
            }
            const user = data.user;
            // console.log("User data:", user);
            setProfile(user);
            setProfileLoaded(profileId);
            if (user._id) {
                getBlogs({ user_id: user._id });
            }
            setLoading(false);
        })
        .catch(err => {
            console.error("Error fetching user profile:", err);
            setProfile(profileDataStructure);
            setLoading(false);
        })
    }

    const getBlogs = ({ page = 1, user_id }) => {
        // If no user_id is provided and blogs is null, don't proceed
        if (!user_id && !blogs) return;
        
        // Use provided user_id or get it from blogs state
        const authorId = user_id || blogs.user_id;
        
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/search-blogs', { author: authorId, page })
        .then( async ({ data }) => {
            let formattedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { author: user_id }
            });

            formattedData.user_id = user_id;
            // console.log("Blogs fetched:", formattedData);
            setBlogs(formattedData);
        })
    }

    useEffect(() => {
        if(profileId != profileLoaded) {
            setBlogs(null);
        }

        if(blogs == null) {
            resetStates();
            fetchUserProfile();
        }

    }, [profileId, blogs])

    const resetStates = () => {
        setProfile(profileDataStructure);
        setLoading(true);
        setProfileLoaded("");
    }

    return (

        <AnimationWrapper>
            {
                loading ? <Loader /> :
                    profile_username.length ?
                        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
                            <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-gray-300 md:sticky md:top-[100px] md:py-10"> 
                                {profile_img && <img src={profile_img} className="!w-48 !h-48 bg-gray-300 rounded-full md:w-32 md:h-32" />}

                                <h1 className="text-xl font-medium" >@{profile_username}</h1>
                                <p className="text-xl capitalize h-6">{fullname}</p>

                                <p>{total_posts.toLocaleString()} Blogs | {total_reads.toLocaleString()} Reads</p>

                                <div className="flex gap-4 mt-2">

                                    {
                                        profileId == username ? <Link to="/settings/edit-profile" className='btn-light rounded-md'>Edit Profile</Link> : null
                                    }

                                </div>

                                <AboutUser className="max-md:hidden" bio={bio} social_links={social_links} joinedAt={joinedAt} />

                            </div>

                                <div className="max-md:mt-12 w-full">
                                    
                                    <InPageNavigation
                                        routes={[ "Blogs Published", "About"]}
                                        defaultHidden={["About"]}
                                    >
                                        {/* Latest Blogs */}
                                        <>
                                        {blogs == null ? (
                                            <Loader />
                                        ) : blogs && blogs.result && blogs.result.length ? (
                                            blogs.result.map((blog, i) => {
                                            return (
                                                <AnimationWrapper
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                key={i}
                                                >
                                                <BlogPostCard
                                                    content={blog}
                                                    author={blog.author.personal_info}
                                                />
                                                </AnimationWrapper>
                                            );
                                            })
                                        ) : (
                                            <NoDataMessage message="No Blog Published" />
                                        )}

                                        <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />

                                        </>

                                        {/* About */}
                                        <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} />

                                    </InPageNavigation>
                                    
                                </div>

                        </section>
                    : <PageNotFound />
            }
        </AnimationWrapper>

    );
};

export default ProfilePage;

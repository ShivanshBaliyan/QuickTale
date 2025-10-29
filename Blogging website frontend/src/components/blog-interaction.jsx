import { useContext } from "react";
import { BlogContext } from "../pages/blog.page.jsx";
import { Link } from "react-router-dom";
import { UserContext } from "../App.jsx";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { useEffect } from "react";

const BlogInteraction = () => {
  let {
    blog,
    blog: {
      _id,
      title,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlog,
    isLikedByUser,
    setLikedByUser,
    commentsWrapper,
    setCommentsWrapper,
  } = useContext(BlogContext);

  let { userAuth: { username, access_token } } = useContext(UserContext);

  useEffect(() => {
    if(access_token){
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/isliked-by-user', { _id }, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      .then(({ data: { result } }) => {
        setLikedByUser(result);
        // console.log(result);
      })
      .catch(err => {
        console.log(err);
      })
    }
  }, [])

  const handleLike = () => {
    if(access_token) {
      
      setLikedByUser(preVal => !preVal)
      // Fix the logic: when user likes, increment; when unlikes, decrement
      let newTotalLikes = isLikedByUser ? total_likes - 1 : total_likes + 1;

      setBlog({ ...blog, activity: { ...activity, total_likes: newTotalLikes } })

      // Send the current state (before toggling) to the server
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/like-blog", { _id, isLikedByUser }, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      .then(({ data }) => {
        // console.log(data);
      })
      .catch(err => {
        // Revert the UI change if the request fails
        setLikedByUser(preVal => !preVal);
        setBlog({ ...blog, activity: { ...activity, total_likes } });
        console.log(err);
      })

    }else {
      toast.error("Please log in to like the blog")
    }
  }

  return (
    <>
        <Toaster />
        <hr className="border-gray-300 my-2" />

        <div className="flex gap-6 justify-between">
            <div className="flex gap-15 items-center">
                {/* Total likes */}
                <div className="flex gap-3 items-center">
                    <button 
                      onClick={handleLike}
                      className={`!w-10 !h-10 rounded-full flex items-center justify-center ${isLikedByUser ? `bg-red-400/20 text-red-600` : `bg-gray-300/80` }`}
                    >
                        <i className={`fa-${isLikedByUser ? `solid` : `regular`} fa-heart`}></i>
                    </button>

                    <p className="text-xl text-gray-800" >{ total_likes }</p>
                </div>

                {/* Total comments */}
                <div className="flex gap-3 items-center">
                    <p className="text-xl text-gray-800" >{ total_comments }</p>
                    <button 
                      onClick={() => setCommentsWrapper(preVal => !preVal)}
                      className="!w-10 !h-10 rounded-full flex items-center justify-center bg-gray-200/80">
                      <i className="fa-regular fa-comment-dots"></i>
                    </button>
                </div>
            </div>

            <div className="flex gap-6 items-center">

              {
                username == author_username ? 
                <Link to={`/editor/${blog_id}`} className='underline hover:text-purple-700' >Edit</Link> : ""
              }

                <Link to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`} ><i className="fa-brands fa-twitter text-xl hover:text-[#1DA1f2]"></i></Link>
            </div>
        </div>

        <hr className="border-gray-300 my-2" />
    </>
  )
};

export default BlogInteraction;

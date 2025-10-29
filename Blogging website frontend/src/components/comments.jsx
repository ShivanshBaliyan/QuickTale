import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import { CommentField, NoDataMessage, CommentCard } from "../components/index";
import axios from "axios";
import { AnimationWrapper } from "../common/common";

export const fetchComments = async ({ skip = 0, blog_id, setParentCommentCountFun, comment_array = null }) => {
    let res;

    await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/get-blog-comments', { blog_id, skip })
    .then(({ data }) => {
        // only increment if data is an array
        if (Array.isArray(data) && data.length) {
            setParentCommentCountFun(preVal => preVal + data.length);
        }

        if(comment_array == null) {
            res = { results: data };
        }else {
            res = { results: [ ...comment_array, ...data ] };
        }

    })
    .catch(err => {
        console.error('Failed to fetch comments:', err?.message || err);
        // Return a safe empty result so callers don't break
        if(comment_array == null) {
            res = { results: [] };
        } else {
            res = { results: comment_array };
        }
    });

    return res;
};

const CommentsContainer = () => {

    let { blog, blog: { _id, title, comments, comments: { results : commentsArr } = {}, activity: { total_parent_comments } = {} } = {}, setBlog, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded } = useContext(BlogContext);

    // Load more comments function
    const loadMoreComments = async () => {
        console.debug('loadMoreComments - skip:', totalParentCommentsLoaded, 'blog_id:', _id);
        let newCommentArr = await fetchComments({
            skip: totalParentCommentsLoaded,
            blog_id: _id,
            setParentCommentCountFun: setTotalParentCommentsLoaded,
            comment_array: commentsArr,
        });
        console.debug('loadMoreComments - fetched:', (newCommentArr && newCommentArr.results) ? newCommentArr.results.length : 0);
        setBlog(prev => ({ ...prev, comments: newCommentArr }));
    };

    return (
    <div className={`max-sm:w-full fixed ${commentsWrapper ? 'right-0 sm:right-0' : 'top-[100%] sm:right-[-100%]'} duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden`}>

            <div className="relative">
                <h1 className="text-xl font-medium">Comments</h1>
                <p className="text-lg mt-2 w-[70%] text-gray-700 line-clamp-1">{ title }</p>

                <button
                    onClick={() => setCommentsWrapper(preVal => !preVal)} 
                    className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-gray-200">
                    <i className="fa-solid fa-xmark text-2xl mt-1"></i>
                </button>
            </div>

            <hr className="border-gray-800 my-8 w-[120%] -ml-10" />

            <CommentField action="comment" />

            {
                commentsArr && commentsArr.length ? 
                commentsArr.map((comment, i) => {
                    return (
                        <AnimationWrapper key={comment._id || i}>
                            <CommentCard index={i} leftVal={comment.childrenLevel * 4} commentData={comment} />
                        </AnimationWrapper>
                    )
                }) 
                : 
                <NoDataMessage message="No comments available" />
            }

            {
                // show Load More only when total_parent_comments (server) is greater than loaded count (client)
                (Number(total_parent_comments || 0) > Number(totalParentCommentsLoaded || 0)) ?
                <button onClick={loadMoreComments} className="text-gray-800 !p-2 !px-3 hover:bg-gray-400/30 rounded-md flex items-center gap-2">
                    Load More
                </button>
                : null
            }

        </div>
    )    
};

export default CommentsContainer;
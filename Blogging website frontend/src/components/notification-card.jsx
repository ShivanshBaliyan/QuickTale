import { Link } from "react-router-dom";
import { getDay } from "../common/common";
import { useState, useContext } from "react";
import { NotificationCommentField } from '../components/index'
import { UserContext } from "../App";
import axios from "axios";

const NotificationsCard = ({ data, index, notificationState}) => {

    let [ isReplying, setIsReplying ] = useState(false);

    // Safely extract nested fields with defaults to avoid runtime errors when some data is missing
    const {
        seen,
        type,
        reply,
        createdAt,
        comment = {},
        replied_on_comment = {},
        user = {},
        blog = {},
        _id: notification_id
    } = data || {};

    const personal_info = user.personal_info || {};
    const fullname = personal_info.fullname || '';
    const username = personal_info.username || '';
    const profile_img = personal_info.profile_img || '';

    const { _id: blog_db_id = '', blog_id = '', title = '' } = blog || {};

    const { userAuth: { username: author_username, profile_img: author_profile_img, access_token } = {} } = useContext(UserContext) || {};

    // notificationState may contain notifications in either `results` or `result` key
    let { notifications = {}, setNotifications } = notificationState || {};
    let results = (notifications && (notifications.results || notifications.result)) || [];
    let totalDocs = notifications.totalDocs || 0;

    const handleReplyClick = () => {
        setIsReplying(preVal => !preVal)
    }

    const handleDelete = (comment_id, type, target) => {
        target.setAttribute("disabled", true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment", {_id: comment_id}, {
            headers:{
                'Authorization': `Bearer ${access_token}`,
            }
        })
        .then(() => {
            // Work on a shallow copy to avoid mutating state directly
            const updated = [...results];

            if (type === "comment"){
                // remove the whole notification
                if (typeof index === 'number' && updated[index]) updated.splice(index,1);
            } else {
                // remove the reply field if present
                if (typeof index === 'number' && updated[index] && updated[index].reply) delete updated[index].reply;
            }

            // Build new notifications object keeping the original key (results or result)
            const newNotifications = { ...notifications };
            if (notifications.results) newNotifications.results = updated;
            else if (notifications.result) newNotifications.result = updated;
            else newNotifications.results = updated;

            target.removeAttribute("disabled")
            setNotifications({ ...newNotifications, totalDocs: Math.max(0, totalDocs-1), deletedDocCount: (notifications.deletedDocCount || 0) + 1 })
        })
        .catch(err => {
            console.log(err)
            target.removeAttribute("disabled")
        })
    }

    return (
        <div className={`!p-6 border-b border-gray-400 border-l-black ${!seen ? "border-l-2" : ""}`}>
            <div className="flex gap-5 mb-3">
                <img src={profile_img} className="!w-14 !h-14 flex-none rounded-full" />
                <div className="w-full">
                    <h1 className="font-medium text-xl text-gray-600">
                        <span className="lg:inline-block hidden capitalize">{fullname}</span>
                        <Link to={`/user/${username}`} className="mx-1 text-black underline">@{username}</Link>
                        <span className="font-normal">
                            {
                                type == 'like' ? 'liked your blog' :
                                type == 'comment' ? 'commented on' : 'replied on'
                            }
                        </span>
                    </h1>

                    {
                        type === 'reply' ? 
                        <div className="p-4 mt-4 rounded-md bg-gray-200">
                            <p>{ replied_on_comment?.comment || '' }</p>
                        </div>
                        : 
                        <Link to={`/blog/${blog_id}`} className="font-medium text-gray-600 hover:underline line-clamp-1">{`${title}`}</Link>
                    }      

                </div>
            </div>

            {
                type !== 'like' ? 
                <p className="ml-14 pl-5 font-gelasio text-xl my-5">{comment?.comment || ''}</p>
                : ""
            }

            <div className="ml-14 pl-5 mt-3 text-gray-600 flex gap-8">
                <p>{getDay(createdAt)}</p>

                {
                    type !== 'like' ? 
                    <>
                        {
                            !reply ? 
                            <button className="underline hover:text-black" onClick={handleReplyClick}>Reply</button>
                            : null
                        }
                        <button className="underline hover:text-black" onClick={(e) => handleDelete(comment?._id || '', "comment", e.target)}>Delete</button>
                    </> : null
                }

            </div>

            {
                isReplying ? 
                <div className="mt-8">
                    <NotificationCommentField _id = {_id} blog_author={user} index={index} replyingTo={comment._id} setIsReplying={setIsReplying} notification_id={notification_id} notificationData={notificationState} />
                </div> : ""
            }

            {
                reply ?
                <div className="ml-20 p-5 bg-gray-200 mt-5 rounded-md">
                    <div className="flex gap-3 mb-3">
                        <img src={author_profile_img} className="!w-8 !h-8 rounded-full" />

                        <div>
                            <h1 className="font-medium text-xl text-gray-600">
                                <Link to={`/user/${author_username}`} className="!mx-1 text-black underline">@{author_username}</Link>

                                <span className="font-normal">replied to</span>

                                <Link to={`/user/${username}`} className="mx-1 text-black underline">@{username}</Link>
                            </h1>
                        </div>
                    </div>

                    <p className="ml-14 font-gelasio text-xl my-2">{reply.comment}</p>

                    <button className="underline hover:text-black ml-14 mt-2" onClick={(e) => handleDelete(comment._id, "reply", e.target)}>Delete</button>

                </div> : ""
            }

        </div>
    )
}

export default NotificationsCard;
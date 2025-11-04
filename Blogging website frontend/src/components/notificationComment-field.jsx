import { useState, useContext } from "react";
import { Toaster, toast } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCommentField = ({ _id, blog_author, index = undefined, replyingTo = undefined, setIsReplying, notification_id, notificationData }) => {

    let [ comment, setComment ] = useState("");

    let { _id: user_id } = blog_author;
    let { userAuth: { access_token } } = useContext(UserContext);
    let { notifications, setNotifications } = notificationData;
    
    // Handle both result and results keys
    const notificationItems = notifications?.results || notifications?.result || [];

    const handleComment = () => {

        if(!comment.length) {
            return toast.error("Write something to post a comment...");
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", {
          _id, blog_author: user_id, comment, replying_to: replyingTo, notification_id
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(({ data }) => {
            setIsReplying(false);
            
            // Update the reply in the correct items array
            const updatedItems = [...notificationItems];
            if (updatedItems[index]) {
                updatedItems[index].reply = {comment, _id: data._id};
                
                // Update notifications with the correct key (results or result)
                if (notifications.results) {
                    setNotifications({...notifications, results: updatedItems});
                } else if (notifications.result) {
                    setNotifications({...notifications, result: updatedItems});
                }
            }
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.data && err.response.data.error) {
                toast.error(err.response.data.error);
            } else {
                toast.error("An error occurred while posting the comment.");
            }
        })

    }

    return (
        <>
            <Toaster />
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a reply..."
                className="input-box !pl-5 placeholder:text-gray-500 resize-none h-[150px] overflow-auto">
            </textarea>

            <button className="btn-dark !mt-5 !px-10" onClick={handleComment}>Reply</button>
        </>
    )
}

export default NotificationCommentField;
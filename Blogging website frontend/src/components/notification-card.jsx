import { Link } from "react-router-dom";

const NotificationsCard = ({ data, index, notificationState}) => {

    let { type, replied_on_comment, user: { personal_info: { fullname, username, profile_img } } } = data;

    return (
        <div className="!p-6 border-b border-gray-400 border-l-black">
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
                        type == 'reply' ? 
                        <div className="p-4 mt-4 rounded-md bg-gray-400">
                            <p>{ replied_on_comment.comment }</p>
                        </div>
                        : <h1>hello</h1>
                    }      

                </div>
            </div>

        </div>
    )
}

export default NotificationsCard;
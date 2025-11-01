import { Link } from "react-router-dom";
import { getDay } from "../common/common";

const MinimalBlogPost = ({ blog, index }) => {

    const { title = '', blog_id: id = '', author = {}, publishedAt } = blog || {};
    const { personal_info = {} } = author || {};
    const { fullname = '', username = '', profile_img = '' } = personal_info;

    return (
        <Link to={`/blog/${id}`} className="flex gap-5 mb-7">
            <h1 className="blog-index">{ index < 10 ? `0${index + 1}` : index}</h1>

            <div>
                <div className="flex gap-2 items-center mb-6">
                    <img src={profile_img} className="!w-6 !h-6 rounded-full" />
                    <p className="line-clamp-1">{fullname} @{username}</p>
                    <p className="min-w-fit">{ getDay(publishedAt) }</p>
                </div>

                <h1 className="blog-title">{ title }</h1>

            </div>

        </Link>
    )

}

export default MinimalBlogPost;
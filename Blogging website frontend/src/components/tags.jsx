import { useContext } from 'react';
import { EditorContext } from '../pages/pages.js';

const Tag = ({ tag, tagIndex }) => {
    const { blog, blog: { tags }, setBlog } = useContext(EditorContext);

    const handleTagDelete = () => {
        const newTags = tags.filter(t => t !== tag);
        setBlog({ ...blog, tags: newTags });
    }

    const handleTagEdit = (e) => {
        if(e.keyCode === 13 || e.keyCode === 188) {
            e.preventDefault();
            let currentTag = e.target.innerText;
            tag[tagIndex] = currentTag;
            setBlog({ ...blog, tags })
            e.target.setAttribute("contentEditable", "false");
        }
    }

    const addEditable = (e) => {
        e.target.setAttribute("contentEditable", "true");
        e.target.focus();
    }

    return (
        <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-8 hover:outline-2">

            <p className="outline-none" onKeyDown={handleTagEdit} onClick={addEditable} >{ tag }</p>

            <button
                className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2"
                onClick={handleTagDelete}
            >
                <i className="fa-solid fa-xmark text-xl pointer-events-none"></i>
            </button>

        </div>
    )
}

export default Tag;
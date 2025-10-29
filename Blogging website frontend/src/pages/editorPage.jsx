import { createContext, useContext, useEffect, useState } from 'react';
import { UserContext } from '../App.jsx';
import { Navigate, useParams } from 'react-router-dom';
import { BlogEditor, Loader, PublishForm } from '../components/index.js';
import axios from 'axios';

const blogStructure = {
    title: "",
    banner: "",
    content: "",
    tags: [],
    des: "",
    author: { personal_info: { } }
}

export const EditorContext = createContext({});

const Editor = () => {

    let { blog_id } = useParams();

    const [ blog, setBlog ] = useState(blogStructure);
    const [ editorState, setEditorState ] = useState("editor"); // "editor" or "publish"
    const [ textEditor, setTextEditor ] = useState({ isReady: false });
    const [ loading, setLoading ] = useState(true);

    const { userAuth } = useContext(UserContext);
    const access_token = userAuth?.access_token;

    useEffect(() => {
        if(!blog_id) {
            return setLoading(false)
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id, draft: true, mode: 'edit' })
        .then(( { data: { blog } } ) => {
            setBlog(blog);
            setLoading(false);
        })
        .catch(err => {
            setBlog(null);
            setLoading(false);
        })

    }, [])

    return (
        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor, setTextEditor }}>
            {
                access_token === null ? <Navigate to="/signin" />
                :
                loading ? <Loader /> : 
                    editorState == "editor" ? <BlogEditor /> : <PublishForm />
            }
        </EditorContext.Provider>
    )
}

export default Editor;
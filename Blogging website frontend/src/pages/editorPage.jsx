import { createContext, useContext, useState } from 'react';
import { UserContext } from '../App.jsx';
import { Navigate } from 'react-router-dom';
import { BlogEditor, PublishForm } from '../components/index.js';

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
    const [ blog, setBlog ] = useState(blogStructure);
    const [ editorState, setEditorState ] = useState("editor"); // "editor" or "publish"
    const [ textEditor, setTextEditor ] = useState({ isReady: false });

    const { userAuth } = useContext(UserContext);
    const access_token = userAuth?.access_token;

    return (
        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor, setTextEditor }}>
            {
                access_token === null ? <Navigate to="/signin" />
                :
                editorState == "editor" ? <BlogEditor /> : <PublishForm />
            }
        </EditorContext.Provider>
    )
}

export default Editor;
import { Link } from 'react-router-dom';
import logo from '../images/logo.png';
import { AnimationWrapper, uploadImage } from '../common/common';
import defaultBanner from '../images/blog-banner.png';
import { useContext, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { EditorContext } from '../pages/pages.js';
import EditorJS from '@editorjs/editorjs';
import { tools } from './tools.jsx';   // importing components/tools

const BlogEditor = () => {
    let { blog, blog: { title, banner, content, tags, des, author }, setBlog, textEditor, setTextEditor, setEditorState } = useContext(EditorContext);

    useEffect(() => {
        setTextEditor(new EditorJS({
            holder: 'textEditor',
            data: content,
            tools: tools,
            placeholder: "Let's write an awesome story!",
        }))
    }, [])

    const handleBannerUpload = (e) => {
        let img = e.target.files[0];

        let loadingToast = toast.loading("Uploading...")

        if(img) {
            uploadImage(img).then((url) => {
                if(url) {
                    toast.dismiss(loadingToast);
                    toast.success("Uploaded👍");
                    setBlog({ ...blog, banner: url });
                }
            })
            .catch(err => {
                toast.dismiss(loadingToast);
                return toast.error(err);
            })
        }
    }

    const handleTitleKeyDown = (e) => {
        if(e.keycode === 13) {
            e.preventDefault();
        }
    }

    const handleTitleChange = (e) => {
        let input = e.target;

        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';

        setBlog({ ...blog, title: input.value });
    }

    const handleErrror = (e) => {
        let img = e.target;
        img.src = defaultBanner;
    }

    const handlePublishEvent = () => {
        if(!banner.length) {
            return toast.error("Upload a blog banner to publish it")
        }

        if(!title.length) {
            return toast.error("Write blog title to publish it")
        }

        if(textEditor.isReady) {
            textEditor.save().then(data => {
                if(data.blocks.length) {
                    setBlog({ ...blog, content: data });
                    setEditorState("publish");
                }else {
                    return toast.error("Write something in your blog to publish it");
                }
            })
            .catch((err) => {
                console.log(err);
            })
        }
    }

    return (
        <>
            <nav className="navbar">
                <Link to="/" className='flex-none w-10'>
                    <img src={logo} />
                </Link>
                <p className='max-md:hidden text-black line-clamp-1 w-full'>
                    { title.length ? title : "New Blog" }
                </p>

                <div className='flex gap-4 ml-auto'>
                    <button className='btn-dark py-2'
                        onClick={handlePublishEvent}
                    >
                        Publish
                    </button>
                    <button className='btn-light py-2'>
                        Save Draft
                    </button>
                </div>
            </nav>
            <Toaster />
            <AnimationWrapper>
                <section>
                    <div className='mx-auto max-w-[900px] w-full'>

                        <div className='relative aspect-video hover:opacity-80 bg-white border-4 border-gray-200'>
                            <label htmlFor="uploadBanner">
                                <img 
                                    src={banner}
                                    className={`z-20`}
                                    onError={handleErrror}
                                />
                                <input 
                                    id="uploadBanner"
                                    type='file'
                                    accept='.png, .jpg, .jpeg'
                                    hidden
                                    onChange={handleBannerUpload}
                                />
                            </label>
                        </div>

                        <textarea
                            defaultValue={title}
                            placeholder='Blog Title'
                            className='text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40'
                            onKeyDown={handleTitleKeyDown}
                            onChange={handleTitleChange}
                        ></textarea>

                        <hr className='w-full opacity-10 my-5' />

                        <div id='textEditor' className='font-gelasio'></div>

                    </div>
                </section>
            </AnimationWrapper>
        </>
    )
}

export default BlogEditor;
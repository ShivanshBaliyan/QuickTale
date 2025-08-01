import { AnimationWrapper } from '../common/common';
import toast, { Toaster } from 'react-hot-toast';
import { useContext } from 'react';
import { EditorContext } from '../pages/pages.js';
import { Tag } from './index.js';

const PublishForm = () => {
    let characterLimit = 200;
    let tagLimit = 10;

    let { blog, setEditorState, setBlog } = useContext(EditorContext);
    let { banner, title, tags, des } = blog;

    const handleCrossEvent = () => {
        setEditorState("editor");
    }

    const handleBlogTitleChange = (e) => {
        let input = e.target;

        setBlog({ ...blog, title: input.value });
    }

    const handleBlogDesChange = (e) => {
        let input = e.target;

        setBlog({ ...blog, des: input.value });        
    }

    const handleTitleKeyDown = (e) => {
        if(e.keyCode == 13) {
            e.preventDefault();
        }
    }

    const handleKeyDown = (e) => {
        if(e.keyCode == 13 || e.keyCode == 188) {
            e.preventDefault();

            let tag = e.target.value;
            if(tags.length < tagLimit) {
                if(!tags.includes(tag) && tag.length) {
                    setBlog({ ...blog, tags: [ ...tags, tag ] })
                }
            }else {
                toast.error(`You can add max ${tagLimit} tags`);
            }

            e.target.value = '';
        }  
    }

    return (
        <AnimationWrapper>
            <section className='w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4'>
                <Toaster/>

                <button className='w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]'
                    onClick={handleCrossEvent}
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <div className='max-w-[550px] center'>
                    <p className='text-gray-600 mb-1'>Preview</p>

                    <div className='w-full aspect-video rounded-lg overflow-hidden bg-gray-300 mt-4'>
                        <img src={banner} />
                    </div>

                    <h1 className='text-4xl font-medium mt-2 leading-tight line-clamp-2'>{title}</h1>

                    <p className='font-gelasio line-clamp-2 text-xl leading-7 mt-4'>{ des }</p>
                </div>

                <div className='border-gray-500 lg:pl-8'>
                    <p className='text-dark mb-2 mt-9'>Blog Title</p>
                    <input 
                        type='text' 
                        placeholder='Blog Title' 
                        value={title} 
                        className='input-box pl-4' 
                        onChange={handleBlogTitleChange} 
                    />

                    <p className='text-dark mb-2 mt-9'>Short description about your blog</p>
                    
                    <textarea
                        maxLength={characterLimit}
                        value={des}
                        className='h-40 resize-none leading-7 input-box pl-4'
                        onChange={handleBlogDesChange}
                        onKeyDown={handleTitleKeyDown}
                    >
                    </textarea>

                    <p className='mt-1 text-gray-600 text-sm text-right'>{ characterLimit - des.length } characters left </p>

                    <p className='text-dark mb-2 mt-9'>Topics - ( Helps in searching and ranking your blog post )</p>

                    <div className='relative input-box pl-2 py-2 pb-4'>

                        <input 
                            type='text'
                            placeholder='Topic'
                            className='sticky input-box !bg-white top-0 left-0 pl-4 mb-3 focus:bg-white'
                            onKeyDown={handleKeyDown}
                        />

                        { 
                            tags.map((i) => {
                                return <Tag tag={i} tagIndex={i} key={i} />
                            })
                        }

                    </div>

                    <p className='mt-1 mb-4 text-gray-600 text-right'>{ tagLimit - tags.length } tags left</p>

                    <button className='btn-dark px-8'>Publish</button>

                </div>

            </section>
        </AnimationWrapper>
    )
}

export default PublishForm;
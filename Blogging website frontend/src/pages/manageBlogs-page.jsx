import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { AnimationWrapper } from "../common/common";
import { Toaster, toast } from "react-hot-toast";
import { InPageNavigation, NoDataMessage, Loader, ManagePublishedBlogCard, ManageDraftBlogCard, LoadMoreDataBtn } from "../components/index";
import { useSearchParams } from "react-router-dom";

const ManageBlogs = () => {

    const [ blogs, setBlogs ] = useState(null);
    const [ drafts, setDrafts ] = useState(null);
    const [ query, setQuery ] = useState("");

    let activeTab = useSearchParams()[0].get("tab");

    let { userAuth } = useContext(UserContext);
    let access_token = userAuth?.access_token;

    const getBlogs = ({ page, draft, deletedDocCount = 0 }) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/user-written-blogs', {
            page, draft, query, deletedDocCount
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(async ({ data }) => {
            // fetch total count separately so we know whether more pages exist
            try {
                const countRes = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/user-written-blogs-count', { draft, query }, {
                    headers: { 'Authorization': `Bearer ${access_token}` }
                });

                const existingState = draft ? drafts : blogs;

                // If loading a page > 1, append results to existing state
                let combinedResults = Array.isArray(data.blogs) ? data.blogs.slice() : [];
                if (existingState && page > 1 && Array.isArray(existingState.result)) {
                    combinedResults = existingState.result.concat(combinedResults);
                }

                let formatedData = {
                    result: combinedResults,
                    page: page,
                    totalDocs: countRes.data.totalDocs,
                    deletedDocCount: deletedDocCount || 0
                }

                if (draft) {
                    setDrafts(formatedData)
                } else {
                    setBlogs(formatedData)
                }

            } catch (err) {
                console.log('Failed to get blogs count', err);
                // fallback to conservative values
                let formatedData = {
                    result: data.blogs,
                    page: page,
                    totalDocs: data.blogs.length,
                    deletedDocCount: deletedDocCount || 0
                }

                if (draft) setDrafts(formatedData); else setBlogs(formatedData);
            }

        })
        .catch(err => {
            console.log(err)
        })

    }

    useEffect(() => {

        if(access_token) {
            if(blogs == null) {
                getBlogs({ page: 1, draft: false })
            }
            if(drafts == null) {
                getBlogs({ page: 1, draft: true })
            }
        }

    }, [access_token, blogs, drafts, query])

    const handleSearch = (e) => {
        let searchQuery = e.target.value;

        setQuery(searchQuery)

        if(e.keycode == 13 && searchQuery.length) {
            setBlogs(null);
            setDrafts(null);
        }
    }

    const handleChange = (e) => {
        if(e.target.value.length) {
            setQuery("");
            setBlogs(null);
            setDrafts(null);
        }
    }

    return (
        <>
            <h1 className="max-md:hidden mb-10">Manage Blogs</h1>
            <Toaster />

            <div className="relative !max-md:mt-5 !md:mt-8 !mb-10 !mt-8">
                <input
                    type="search"
                    className="!w-full bg-gray-200 !p-4 !pl-12 !pr-6 rounded-full placeholder:text-gray-500"
                    placeholder="Search Blogs"
                    onChange={handleChange}
                    onKeyDown={handleSearch}
                />

                <i className="fa-solid fa-magnifying-glass absolute right-[3%] md:pointer-events-none !md:left-5 !top-1/2 !-translate-y-1/2 text-xl text-gray-500"></i>
            </div>

            <InPageNavigation routes={["Published Blogs", "Drafts"]} defaultActiveIndex={ activeTab != 'draft' ? 0 : 1 }>
                
                {/* Published blogs */}
                {
                    blogs == null ? <Loader /> :
                    blogs.result && blogs.result.length ? 

                        <>
                        {
                            blogs.result.map((blog, i) => {
                                return <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>

                                    <ManagePublishedBlogCard blog={{ ...blog, index: i, setStateFunc: setBlogs }} />

                                </AnimationWrapper>
                            })
                        }

                        <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} additionalParam={{ draft: false, deletedDocCount: blogs.deletedDocCount }} />

                        </>

                    : <NoDataMessage message="No Published Blogs" />
                }


                {/* draft blogs */}
                {
                    drafts == null ? <Loader /> :
                    drafts.result && drafts.result.length ? 

                        <>
                        {
                            drafts.result.map((blog, i) => {
                                return <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>

                                    <ManageDraftBlogCard blog={{ ...blog, index: i + 1, setStateFunc: setDrafts }} />

                                </AnimationWrapper>
                            })
                        }

                        <LoadMoreDataBtn state={drafts} fetchDataFun={getBlogs} additionalParam={{ draft: true, deletedDocCount: drafts.deletedDocCount }} />

                        </>

                    : <NoDataMessage message="No Drafts Blogs" />
                }
                
            </InPageNavigation>

        </>
    )
}

export default ManageBlogs;
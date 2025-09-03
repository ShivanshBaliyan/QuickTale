import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AnimationWrapper, filterPaginationData } from "../common/common.js";
import {
  Loader,
  BlogPostCard,
  NoDataMessage,
  LoadMoreDataBtn,
  InPageNavigation,
  UserCard,
} from "../components/index.js";

const SearchPage = () => {

  let { query } = useParams();
  let [blogs, setBlogs] = useState(null);
  let [ users, setUsers ] = useState(null);

  const searchBlogs = ({ page = 1, create_new_arr = false }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        query,
        page,
      })
      .then(async ({ data }) => {
        // console.log("Received data from search-blogs upr:", data);

        let formattedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { query },
          create_new_arr
        });

        // console.log("Formatted data  neeche:", formattedData);
        
        setBlogs(formattedData);

      })
      .catch((err) => {
        console.log("Error fetching search blogs:", err);
      });
  };

  const fetchUsers = () => {
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query })
    .then(({ data: { users } }) => {
      setUsers(users);
    })
  }

  useEffect(() => {

    resetState();
    searchBlogs({ page: 1, create_new_arr: true });
    fetchUsers();

  }, [query]);

  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  }

  const UserCardWrapper = () => {
    return (
      <>
        {
          users == null ? <Loader /> :
            users.length ? 
              users.map((user, i) => {
                return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }}>

                  <UserCard user={user} />

                </AnimationWrapper>
              })
            :
            <NoDataMessage message="No users found" />
        }
      </>
    )
  }

  return (
      <section className="h-cover flex justify-center gap-10">

        <div className="w-full">
            <InPageNavigation routes={[`Search results for "${query}"`, "Accounts Matched"]} defaultHidden={["Accounts Matched"]}>

                <>
                    {
                      blogs == null ? (
                            <Loader />
                      ) : blogs && blogs.result && blogs.result.length ? (
                          <>
                              {blogs.result.map((blog, i) => {
                                  return (
                                    <AnimationWrapper
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        key={i}
                                    >
                                        <BlogPostCard
                                        content={blog}
                                        author={blog.author.personal_info}
                                        />
                                    </AnimationWrapper>
                                    );
                                })}
                            </>
                        ) : (
                            <NoDataMessage message="No blogs published" />
                      )}

                    <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs} />
                </>

                <UserCardWrapper />

            </InPageNavigation>
        </div>

        <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-gray-300 pl-8 pt-3 max-md:hidden ">
          <h1 className="font-medium text-xl mb-8">User related to search <i className="fa-regular fa-user pl-1"></i></h1>

          <UserCardWrapper />

        </div>

      </section>
  );
};

export default SearchPage;

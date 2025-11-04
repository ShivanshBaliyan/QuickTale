import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { AnimationWrapper, filterPaginationData } from "../common/common";
import { Loader, NoDataMessage, NotificationsCard, LoadMoreDataBtn } from "../components/index";

const Notifications = () => {

    let {userAuth,userAuth: {access_token, new_notification_available}, setUserAuth} = useContext(UserContext)

    const [ filter, serFilter ] = useState('all');
    const [ notifications, setNotifications ] = useState(null)

    let filters = ['all', 'like', 'comment', 'reply'];

    const fetchNotifications = ({page, deletedDocCount = 0}) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/notifications", {page, filter, deletedDocCount}, {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        })
        .then(async({data: {notifications: data }}) => {
            if(new_notification_available){
                setUserAuth({...userAuth, new_notification_available: false})
                
            }
            let formatedData = await filterPaginationData({
                state: notifications,
                data, page,
                countRoute: "/all-notifications-count",
                data_to_send: {filter},
                user: access_token

            })
            setNotifications(formatedData)
            
        })
        .catch(err => console.log(err))
    }

    useEffect(() => {
        if(access_token) {
            fetchNotifications({ page: 1 })
        }

    }, [access_token, filter])

    const handleFilter = (e) => {
        let btn = e.target;
        serFilter(btn.innerHTML);
        setNotifications(null);
    }

    return (
        <div>

            <h1 className="max-md:hidden">Recent Notifications</h1>

            <div className="my-8 flex gap-6">
                {
                    filters.map((filterName, i) => {
                        return <button key={i} className={`!py-2 ${filter == filterName ? 'btn-dark' : 'btn-light'} `} onClick={handleFilter}>{ filterName }</button>
                    })
                }
            </div>

            {
               notifications == null ? <Loader /> : 
               <>
                   {
                       // normalize both possible shapes: `result` (singular) or `results` (plural)
                       (() => {
                           const items = notifications.results ?? notifications.result ?? [];
                           if (!items.length) return <NoDataMessage message="Nothing available" />;

                           return items.map((notification, i) => {
                               return <AnimationWrapper key={i} transition={{delay: i*0.08}}>
                                   <NotificationsCard data={notification} 
                                       index={i}
                                       notificationState={{notifications, setNotifications}}
                                   />
                               </AnimationWrapper>
                           })
                       })()
                   }
                   <LoadMoreDataBtn state={notifications} fetchDataFun={fetchNotifications} additionalParam = {{deletedDocCount: notifications.deletedDocCount}} />
               </>
            }

        </div>
    )
}

export default Notifications;
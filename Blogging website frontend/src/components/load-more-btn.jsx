const LoadMoreDataBtn = ({ state, fetchDataFun }) => {

    if(state != null && state.totalDocs > state.result.length) {
        return (
            <button 
            onClick={() => fetchDataFun({ page: state.page + 1 })}
            className="text-gray-800 p-2 px-3 hover:bg-gray-400/30 rounded-md flex items-center gap-2"
            >
                Load More
            </button>
        )
    }

}

export default LoadMoreDataBtn;

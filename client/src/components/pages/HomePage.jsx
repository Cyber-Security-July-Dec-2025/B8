import { useChatStore } from "../../store/chatStore"
import ChatBox from "../ChatBox.jsx"
import Sidebar from "../Sidebar.jsx"
import NoChat from "./NoChat.jsx"
function HomePage() {

    const  {getUsers , getMessages , selectedUser , messages} = useChatStore();
    return (
        <div className="h-screen bg-base-200">
            <div className="flex items-center justify-center pt-20 px-4">
                <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
                    <div className="flex h-full rounded-lg overflow-hidden">
                        <Sidebar/>
                        {!selectedUser ? <NoChat/> : <ChatBox/>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage

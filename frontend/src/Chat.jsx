import { useContext, useEffect, useRef, useState } from "react"
import Avatar from "./Avatar";
import { UserContext } from "./UserContext";
import {uniqBy} from "lodash";
import Contact from "./Contact";

const Chat =()=>{
    const [ws,setWs]=useState(null);
const [onlinePeople,setOnlinePeople]=useState({});
const [selectedUserId,setSelectedUserId]=useState(0)
const {username,id,setId,setUsername}=useContext(UserContext)    
const [newMessageText,setNewMessageText]=useState("");
const [messages,setMessages]=useState([]);
const divUnderMessage=useRef()
const [offlinePeople,setOfflinePeople] = useState({});

const showOnlinePeople=(peopleArray)=>{
    const people={};
    peopleArray.forEach(({userId,username}) => {
        people[userId] = username;
      });
      setOnlinePeople(people);
    }
useEffect(()=>{
    connectToWs()
},[])

const connectToWs=()=>{
    const ws=    new WebSocket('ws://localhost:4040')
setWs(ws)  

ws.addEventListener('message',(e)=>{
const messageData=JSON.parse(e.data);
if('online' in messageData ){
    showOnlinePeople(messageData.online)
}
else{
setMessages(prev=>([...prev,{...messageData}]))
}

})

ws.addEventListener('close',()=>{
setTimeout(()=>{
connectToWs();
},1000)
})

}

const fetchMessage=async()=>{
   await fetch(`/messages/${selectedUserId}`,{
    'credentials':'include'

   })
        .then(response => response.json()) // Convert the response to JSON
        .then(data => {
setMessages(data)
        })
        .catch(error => {
          console.error('Error fetching messages:', error);
        });
}

useEffect(() => {
    if (selectedUserId) {
      fetchMessage()
    }
  }, [selectedUserId]);

useEffect(()=>{
    const div=divUnderMessage.current;
    if(div){
    div.scrollIntoView({behavior:'smooth',block:'end'})
    }
},[messages])

const fetchOfflinePeople = async () => {
    try {
      const response = await fetch('/people');
      const data = await response.json();
      
      const offlinePeopleArr = data
        .filter(p => p._id !== id)
        .filter(p => !Object.keys(onlinePeople).includes(p._id));
      
      const offlinePeople = {};
      offlinePeopleArr.forEach(p => { 
        offlinePeople[p._id] = p;
      });
      
      setOfflinePeople(offlinePeople);
      console.log(offlinePeople,'offline')
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

useEffect(() => {
    fetchOfflinePeople()
  }, [onlinePeople]);

const sendMessage=(e)=>{
e.preventDefault();
ws.send(JSON.stringify({
        recipient:selectedUserId,
        text:newMessageText
    
}))
setNewMessageText("")
setMessages(prev=>([...prev,{text:newMessageText,sender:id,recipient:selectedUserId,_id:Date.now()}]));
}

function logout() {
  fetch('/logout', {
    method: 'POST',
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    return response.json(); // or response.text() if the server does not return JSON
  })
  .then(() => {
    setWs(null);
    setId(null);
    setUsername(null);
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}


const onlinePeopleExclOurUser = {...onlinePeople};
  delete onlinePeopleExclOurUser[id];

  const messagesWithoutDupes=uniqBy(messages,'_id');
    return (
<div className="h-screen flex ">
    <div className="bg-white w-1/3 overflow-y-scroll flex flex-col">
    <div className="flex-grow">
    <div className="text-blue-600 font-bold flex gap-2 items-center p-4">
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="w-4 h-4"
        aria-label="User profile icon"
        role="img"
    >
        <path 
            fillRule="evenodd" 
            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" 
            clipRule="evenodd" 
        />
    </svg>
    Mern Chat
</div>

{Object.keys(onlinePeopleExclOurUser).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={onlinePeopleExclOurUser[userId]}
              onClick={() => {setSelectedUserId(userId);console.log({userId})}}
              selected={userId === selectedUserId} />
          ))}
          {Object.keys(offlinePeople).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId} />
          ))}
    </div>
    <div className="p-2 text-center flex items-center justify-center">
          <span className="mr-2 text-sm text-gray-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
            {username}
          </span>
          <button
            onClick={logout}
            className="text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm">logout</button>
        </div>
      </div>
    <div className="bg-blue-50 w-full p-2 flex flex-col">
        <div className="flex-grow">
            {!selectedUserId && (
                <div className="flex h-full items-center justify-center">
                    <div className="text-gray-300">&larr; Select a person from the sidebar</div> 
</div>            ) }
{selectedUserId && (
    <div className="relative h-full pb-4">
    <div  className="overflow-y-scroll absolute inset-0 top-0 left-0 right-0 bottom-2">
        {messagesWithoutDupes.map(message=>(
            <div key={message._id} className={`${message.sender===id?'text-right':'text-left'}`}>
        <div className={`p-2 my-2 text-left inline-block rounded-md text-sm  ${message.sender===id ?'bg-blue-500 text-white':'bg-white text-black'}`}>{message.text}</div>
       </div>
        ))}
        <div ref={divUnderMessage} className=""></div>
        </div>
        </div>
)}

            </div>
            {selectedUserId && (
        <form className="flex gap-2 mx-2" onSubmit={sendMessage}>
    <input type="text" value={newMessageText} onChange={e=>setNewMessageText(e.target.value)} placeholder="Type message here" className="bg-white border p-2 flex-grow"/>
    <button type="submit" className="bg-blue-500 p-2 rounded-md">
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
            <path d="m27.45 15.11-22-11a1 1 0 0 0 -1.08.12 1 1 0 0 0 -.33 1l2.65 9.77h11.31v2h-11.31l-2.69 9.74a1 1 0 0 0 1 1.26 1 1 0 0 0 .45-.11l22-11a1 1 0 0 0 0-1.78z"/>
            <path d="m0 0h32v32h-32z" fill="none"/>
        </svg>
    </button>
    </form>
            )}
</div>

</div>
    )
}
export default Chat
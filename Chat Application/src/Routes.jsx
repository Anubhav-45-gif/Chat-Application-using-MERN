import { useContext } from "react"
import { UserContext } from "./UserContext"
import RegisterAndLoginForm from "./RegisterAndLoginForm"
import Chat from "./Chat"
import { BrowserRouter, Routes, Route } from "react-router-dom";


const RoutesComponent=()=>{
    const {username,id} =useContext(UserContext)
    
    return (
        <>
        <BrowserRouter>
        <Routes>
        <Route path="/" element={<Chat/>}/>

<Route path="/logRegister" element={<RegisterAndLoginForm/>}/>

        </Routes>
        </BrowserRouter>
       {/* <RegisterAndLoginForm/> */}
       </>
    )
}
export default RoutesComponent
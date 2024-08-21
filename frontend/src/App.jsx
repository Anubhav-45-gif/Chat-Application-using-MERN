import RoutesComponent from "./Routes"
import {  UserContextProvider } from "./UserContext"
// import axios from "axios"
function App() {
  // axios.defaults.baseURL='http://localhost:4040';
  // axios.defaults.withCredentials=true;
  return (
    <>
    <UserContextProvider><RoutesComponent/>
    </UserContextProvider>
    </>
  )
}

export default App

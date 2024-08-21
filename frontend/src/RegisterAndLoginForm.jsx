import { useContext, useState } from "react";
import { UserContext } from "./UserContext";

const RegisterAndLoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
  const {setUsername:setLoggedInUsername,setId} = useContext(UserContext);
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');

    const register = async (event) => {
      event.preventDefault(); // Prevent form from submitting the default way
  
      try {
        const url = isLoginOrRegister === 'register' ? 'register' : 'login';

        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: {
                'Content-Type': 'application/json',
              },
          });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data = await response.json();
setLoggedInUsername(username)
setId(data.id)
        // Handle successful registration (e.g., redirect, show a message, etc.)
      } catch (error) {
        console.error('Error:', error);
        // Handle errors (e.g., show an error message)
      }
    };
    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto flex flex-col gap-3 pt-4" onSubmit={register}>
                <input type='text' placeholder="username" className="block w-full rounded-md p-2" onChange={e=>setUsername(e.target.value)} value={username}/>
                <input type='password' placeholder="password" className="w-full block rounded-md p-2" onChange={e=>setPassword(e.target.value)} value={password}/>
                <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === 'register' && (
            <div>
              Already a member?
              <button className="ml-1" onClick={() => setIsLoginOrRegister('login')}>
                Login here
              </button>
            </div>
          )}
          {isLoginOrRegister === 'login' && (
            <div>
              Dont have an account?
              <button className="ml-1" onClick={() => setIsLoginOrRegister('register')}>
                Register
              </button>
            </div>
          )}
        </div>
            </form>
            
            </div>
    )
}
export default RegisterAndLoginForm
import { TextField, Button } from '@mui/material';
import './loginView.css';
import { useState } from 'react';
import { signIn, confirmSignIn } from 'aws-amplify/auth';

const LoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword1, setNewPassword1] = useState('');
    const [newPassword2, setNewPassword2] = useState('');
    const [name, setName] = useState('');
    const [loginState, setLoginState] = useState('login');

    const textStateUpdate = (event) => {
        if (event.target.id === 'email')
            setEmail(event.target.value);
        else if (event.target.id === 'password')
            setPassword(event.target.value);
        else if (event.target.id === 'newPassword1')
            setNewPassword1(event.target.value)
        else if (event.target.id == 'newPassword2')
            setNewPassword2(event.target.value);
        else setName(event.target.value);
    }

    const login = async () => {
        let status = null;
        try {
            status = await signIn({
                username: email,
                password: password
            });
            if (status.nextStep.signInStep == 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
                setLoginState('confirm')
            }
        } catch (e) {
            console.log(e)
            alert('Incorrect username/password')
        }

    }

    const changePassword = async () => {
        if (newPassword1 != newPassword2)
            alert("Passwords do not match!");
        else {
            try {
                console.log(await confirmSignIn({
                    challengeResponse: newPassword1,
                    options: {
                        userAttributes: {
                            name: name
                        }
                    }
                }));
            } catch (e) {
                if (e.name === 'InvalidPasswordException')
                    alert("Error occured, check password conforms to the following rules\n- Minimum 8 charactes\n- Contain at least 1 number\n- Contain at least 1 uppercase letter\n- Contain at least 1 lowercase leter\n- Contain at least 1 special character")
                else alert("Error occured, possible session expiry. Please reload!");
            } 
        }
    }

    return (loginState == 'login' ? <div className="loginView">
        <h1>Login</h1>
        <TextField id="email" placeholder="Email" variant="outlined" style={{backgroundColor: '#323551', width: "70%"}}  inputProps={{ style: { color: "#9C9FBB" } }} onChange={textStateUpdate}></TextField>
        <TextField id="password" placeholder="Password" variant="outlined" type='password' style={{backgroundColor: '#323551', width: "70%"}} inputProps={{ style: { color: "#9C9FBB" } }} onChange={textStateUpdate}></TextField>
        <Button variant="contained" color="primary" onClick={login} style={{width: "150px"}}>
              Log In
        </Button>
    </div> : <div className='loginView'>
            <h1>First Login</h1>
            <TextField id="name" placeholder="Enter name" variant="outlined" style={{backgroundColor: '#323551', width: "70%"}} inputProps={{ style: { color: "#9C9FBB" } }} onChange={textStateUpdate}></TextField>
            <TextField id="newPassword1" placeholder="Enter new password" variant="outlined" type='password' style={{backgroundColor: '#323551', width: "70%"}} inputProps={{ style: { color: "#9C9FBB" } }} onChange={textStateUpdate}></TextField>
            <TextField id="newPassword2" placeholder="Re-enter new password" variant="outlined" type='password' style={{backgroundColor: '#323551', width: "70%"}} inputProps={{ style: { color: "#9C9FBB" } }} onChange={textStateUpdate}></TextField>
            <Button variant="contained" color="primary" onClick={changePassword} style={{width: "150px"}}>
              Login
            </Button>
        </div>)
}

export default LoginView;
import React, { useState } from 'react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here you would typically handle the user login. This could involve sending a request to a server with the username and password, and processing the response.
    console.log(`Logging in with username: ${username} and password: ${password}`);
  };

  return (
    <div>
      <h2>Welcome to University Events!</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <br />
        <input type="submit" value="Login" />
      </form>
    </div>
  );
}

export default Login;
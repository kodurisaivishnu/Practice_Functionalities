import React, { useState } from "react";

const Login = () => {
  const [data, setData] = useState({});
  let handleSubmit = async (event) => {
    event.preventDefault();
    console.log(data);
    // const fd = new FormData(data);
    const fd = new FormData();
    for (let [key, val] of Object.entries(data)) {
      fd.append(key, val);
    }
    console.log("API CALL INITIALTED : ");
    await fetch("http://localhost:3000/login", { method: "POST", body: fd })
      .then((res) => res.json())
      .then((res) => console.log(res))
      .catch((err) => {
        console.log(err);
      });
    console.log("API CALL ENDED : ");

    console.log([...fd.entries()]);
  };
  return (
    <form action="" className="flex" onSubmit={handleSubmit}>
      <div className="flex">
        <input
          type="text"
          name="name"
          id="name"
          placeholder="enter your name"
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
        <input
          type="text"
          name="password"
          id="password"
          placeholder="password"
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />
      </div>
      <button>submit</button>
    </form>
  );
};

export default Login;

import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { UserAtom } from "../recoil/atoms/user";

function Login() {
  const [data, setData] = useState<{ name: String; email: String }>({
    name: "",
    email: "",
  });
  const [_, setUser] = useRecoilState(UserAtom);
  const navigate = useNavigate();
  async function handleSubmit() {
    const resp = await axios.post("http://localhost:5000/user/signIn", data);
    if (resp.data.success) {
      setUser(resp.data.user);
      navigate("/home");
    } else {
      alert(resp.data.error);
    }
  }

  return (
    <div>
      <input
        type="text"
        onChange={(e) => {
          setData({ ...data, email: e.target.value });
        }}
      />
      <input
        type="text"
        onChange={(e) => {
          setData({ ...data, name: e.target.value });
        }}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default Login;

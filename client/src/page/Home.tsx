import { Link, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { UserAtom } from "../recoil/atoms/user";
import { useEffect } from "react";

function Home() {
  const [userData] = useRecoilState(UserAtom);
  const navigate = useNavigate();
  useEffect(() => {
    if (userData == null) {
      navigate("/login");
    }
  }, []);
  return <div>{<Link to={`/game`}>start game</Link>}</div>;
}

export default Home;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./page/Landing";
import Home from "./page/Home";
import Login from "./page/Login";
import Register from "./page/Register";
import Profile from "./page/Profile";
import Game from "./page/Game";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />}></Route>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/signup" element={<Register />}></Route>
          <Route path="/profile" element={<Profile />}></Route>
          <Route path="/game" element={<Game />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

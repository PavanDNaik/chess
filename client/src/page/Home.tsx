import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <Link to={`/game`}>start game</Link>
    </div>
  );
}

export default Home;

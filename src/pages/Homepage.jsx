import Sidebar from "../components/Sidebar";
import Dashboard from "./Dashboard";

const Home = () => {
  return (
    <div className="flex bg-gray-800 min-h-screen w-screen">
      <Sidebar />
      <Dashboard />
    </div>
  );
};

export default Home;

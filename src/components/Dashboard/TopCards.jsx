import { SlCamrecorder } from "react-icons/sl";
import { IoMdWarning } from "react-icons/io";
import { FaHelmetSafety } from "react-icons/fa6";
import { FaHeartPulse } from "react-icons/fa6";

const TopCards = () => {
    const cardsData = [
        {
            title:'Active Cameras',
            active:'150',
            total:'200',
            icon:<SlCamrecorder className="text-blue-700" />,
           
        },
        {
            title:'Open Incidents',
            total:'5',
            critical:'2',
            icon:<IoMdWarning className="text-red-700"/>,
           
        },
        {
            title:'PPE Violations Today',
            today:'12',
            yesterday:'20',
            icon:<FaHelmetSafety className="text-yellow-700"/>
        },
        {
            title:'System Health',
            percentage:'99.9%',
            status:'Excellent',
            icon:<FaHeartPulse className="text-green-700"/>,
        }
    ];
  return (
    <div className="grid lg:grid-cols-4 gap-4 p-4">
        {cardsData.map((card, index) => (
            <div key={index} className="bg-white dark:bg-gray-700 dark:text-white rounded-lg shadow-md p-4 flex items-center">
                
                <div>
                    <h2 className="text-lg font-semibold">{card.title}</h2>
                    <div className="mt-2">
                        {card.active && <p>Active: {card.active}</p>}
                        {card.total && <p>Total: {card.total}</p>}
                        {card.critical && <p>Critical: {card.critical}</p>}
                        {card.today && <p>Today: {card.today}</p>}
                        {card.yesterday && <p>Yesterday: {card.yesterday}</p>}
                        {card.percentage && <p>Uptime: {card.percentage}</p>}
                    </div>
                </div>
                <div className="text-4xl ml-auto mr-5">
                    {card.icon}
                </div>
            </div>
        ))}
    </div>
  )
}

export default TopCards
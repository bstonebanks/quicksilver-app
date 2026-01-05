import Architecture from './pages/Architecture';
import AutoDetect from './pages/AutoDetect';
import Geofences from './pages/Geofences';
import History from './pages/History';
import Home from './pages/Home';
import Map from './pages/Map';
import MigrateToDynamoDB from './pages/MigrateToDynamoDB';
import Notifications from './pages/Notifications';
import Payments from './pages/Payments';
import TollPasses from './pages/TollPasses';
import Vehicles from './pages/Vehicles';
import AWSSetup from './pages/AWSSetup';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Architecture": Architecture,
    "AutoDetect": AutoDetect,
    "Geofences": Geofences,
    "History": History,
    "Home": Home,
    "Map": Map,
    "MigrateToDynamoDB": MigrateToDynamoDB,
    "Notifications": Notifications,
    "Payments": Payments,
    "TollPasses": TollPasses,
    "Vehicles": Vehicles,
    "AWSSetup": AWSSetup,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
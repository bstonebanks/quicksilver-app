import Architecture from './pages/Architecture';
import AutoDetect from './pages/AutoDetect';
import History from './pages/History';
import Home from './pages/Home';
import Map from './pages/Map';
import Notifications from './pages/Notifications';
import Payments from './pages/Payments';
import Vehicles from './pages/Vehicles';
import TollPasses from './pages/TollPasses';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Architecture": Architecture,
    "AutoDetect": AutoDetect,
    "History": History,
    "Home": Home,
    "Map": Map,
    "Notifications": Notifications,
    "Payments": Payments,
    "Vehicles": Vehicles,
    "TollPasses": TollPasses,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
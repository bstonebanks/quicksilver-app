import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import Payments from './pages/Payments';
import History from './pages/History';
import Map from './pages/Map';
import AutoDetect from './pages/AutoDetect';
import Architecture from './pages/Architecture';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Vehicles": Vehicles,
    "Payments": Payments,
    "History": History,
    "Map": Map,
    "AutoDetect": AutoDetect,
    "Architecture": Architecture,
    "Analytics": Analytics,
    "Notifications": Notifications,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
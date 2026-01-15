import AWSSetupGuide from './pages/AWSSetupGuide';
import App from './pages/App';
import Architecture from './pages/Architecture';
import AutoDetect from './pages/AutoDetect';
import DebugDynamoDB from './pages/DebugDynamoDB';
import GeofenceSettings from './pages/GeofenceSettings';
import Geofences from './pages/Geofences';
import History from './pages/History';
import Home from './pages/Home';
import Map from './pages/Map';
import MigrateToDynamoDB from './pages/MigrateToDynamoDB';
import Notifications from './pages/Notifications';
import Payments from './pages/Payments';
import PendingTolls from './pages/PendingTolls';
import TollPasses from './pages/TollPasses';
import Vehicles from './pages/Vehicles';
import RecurringPayments from './pages/RecurringPayments';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AWSSetupGuide": AWSSetupGuide,
    "App": App,
    "Architecture": Architecture,
    "AutoDetect": AutoDetect,
    "DebugDynamoDB": DebugDynamoDB,
    "GeofenceSettings": GeofenceSettings,
    "Geofences": Geofences,
    "History": History,
    "Home": Home,
    "Map": Map,
    "MigrateToDynamoDB": MigrateToDynamoDB,
    "Notifications": Notifications,
    "Payments": Payments,
    "PendingTolls": PendingTolls,
    "TollPasses": TollPasses,
    "Vehicles": Vehicles,
    "RecurringPayments": RecurringPayments,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import Payments from './pages/Payments';
import History from './pages/History';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Vehicles": Vehicles,
    "Payments": Payments,
    "History": History,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
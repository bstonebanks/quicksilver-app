import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import History from './pages/History';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Vehicles": Vehicles,
    "History": History,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
import React, { createContext, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './Home';
import FoodMarket from "./FoodMarket";
import FoodSell from "./FoodSell";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from './NavBar';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Index />
);


export const LoadingContext = createContext("loadingContext")


function Index() {
    const [isLoading, setisLoading] = useState(true)





    return (
        <BrowserRouter>
            <LoadingContext.Provider value={{ isLoading, setisLoading }}>
                <NavBar></NavBar>
                <Routes>
                    <Route index element={<Home />} />
                    <Route path="FoodMarket" element={<FoodMarket />} />
                    <Route path="FoodSell" element={<FoodSell />} />
                </Routes>
            </LoadingContext.Provider>
        </BrowserRouter>
    )
}



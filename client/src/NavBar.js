import ButtonGroup from '@mui/material/ButtonGroup';
import LoadingButton from '@mui/lab/LoadingButton';
import HomeIcon from '@mui/icons-material/Home';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import { useContext } from 'react';
import { LoadingContext } from './index';
import { useLocation, useNavigate } from '../node_modules/react-router-dom/dist/index';


export default function NavBar() {
    const { isLoading, setisLoading } = useContext(LoadingContext)
    const location = useLocation()
    const navigate = useNavigate()


    return (
        <div className='navbar'>
            <ButtonGroup variant="contained" className="button-group">
                <LoadingButton onClick={() => {
                    setisLoading(true)
                    navigate("/")
                }} loading={isLoading && location.pathname == "/"} loadingPosition="start" startIcon={<HomeIcon />}>Home</LoadingButton>
                <LoadingButton onClick={() => {
                    setisLoading(true)
                    navigate("/FoodMarket")
                }} loading={isLoading && location.pathname == "/FoodMarket"} loadingPosition="start" startIcon={<LocalGroceryStoreIcon />}>Food market</LoadingButton>
                <LoadingButton onClick={() => {
                    setisLoading(true)
                    navigate("/FoodSell")
                }} loading={isLoading && location.pathname == "/FoodSell"} loadingPosition="start" startIcon={<LocalGroceryStoreIcon />}>Sell Food</LoadingButton>
            </ButtonGroup>
        </div >
    )
}
import { useContext, useEffect, useState } from "react"
import { LoadingContext } from "."

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Grid, IconButton } from "@mui/material";
import defaultFoodImg from "./img/food.jfif"
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { getUsdToEthRate } from "./utils";

function FoodCard({ index, image, name, price, seller, buyer, isSold, onPurchaseClick }) {

    return (
        <Card key={index} className="food-card">
            <CardMedia
                image={image || defaultFoodImg}
                title={name}
                className="image"
            />
            <CardContent className="content">
                <div className="name">
                    {name || "Burger"}
                </div>
                <div className="form-label">
                    <label htmlFor="price">Price:</label>
                    <div id="price">
                        {"$" + price.toFixed(2) || "5"}
                    </div>
                </div>
                <div className="form-label">
                    <label htmlFor="seller">Seller Address:</label>
                    <div id="seller">
                        {seller || "0xc00000000000000000000000000"}
                    </div>
                </div>
                <div className="form-label">
                    <label htmlFor="contract">Buyer Address:</label>
                    <div id="buyer">
                        {buyer || "0xc00000000000000000000000000"}
                    </div>
                </div>
                <div className="form-label">
                    <label htmlFor="contract">Is Sold:</label>
                    <div id="isSold">
                        {isSold ? "Yes" : "No"}
                    </div>
                </div>
            </CardContent>
            <CardActions>
                <Button variant="contained" className="info">Read More</Button>
                <IconButton disabled={isSold} onClick={() => onPurchaseClick(index)} className="purchase"><ShoppingCartIcon /></IconButton>
            </CardActions>
        </Card>
    )
}


export default function FoodMarket() {
    const { isLoading, setisLoading } = useContext(LoadingContext)
    const [foodList, setfoodList] = useState([])

    const [web3, setweb3] = useState(new Web3())
    const [availableAccounts, setavailableAccounts] = useState([])
    const [account, setaccount] = useState()

    const [usdToEthRate, setusdToEthRate] = useState(1)






    useEffect(() => {
        if (isLoading) {
            init()
        }
    }, [isLoading])





    const init = async () => {
        const provider = await detectEthereumProvider()
        if (provider) {
            const web3 = new Web3(provider)

            setweb3(web3)
        }

        try {
            const response = await (await fetch(process.env.REACT_APP_BACKEND_URL + "/get-contractFoodList")).json()

            setfoodList(response.data)
        } catch (error) {

        }

        setusdToEthRate(await getUsdToEthRate())


        setisLoading(false)
    }




    const connectWallet = async () => {
        const accounts = await web3.eth.requestAccounts()
        setavailableAccounts(accounts)
    }





    const disconnectWallet = async () => {
        setaccount(null)
    }



    async function onPurchaseClick(index) {
        const response = await (await fetch(process.env.REACT_APP_BACKEND_URL + "/get-foodContract")).json()
        const foodContractAbi = response.data.abi
        const foodContractAddress = response.data.address





        try {
            const contract = new web3.eth.Contract(foodContractAbi, foodContractAddress);

            await contract.methods.purchaseFoodItem(foodList[index].id).send({ from: account, value: web3.utils.toWei(foodList[index].price/usdToEthRate,"ether")})
        } catch (error) {
            console.log(error);

        }
    }



    return (
        <>
            {account ?
                <>
                    <div>Connected to: {account}</div>
                    <Button onClick={disconnectWallet}>Disconnect Wallet</Button>

                    <Grid container className="food-market-container" rowGap={4} columnGap={4}>
                        {foodList.length != 0 && foodList.map((food, index) => {
                            return (
                                <FoodCard key={index} onPurchaseClick={onPurchaseClick} index={index} name={food.name} price={food.price} seller={food.seller} buyer={food.buyer} isSold={food.isSold} />
                            )
                        })}
                    </Grid>
                </>
                :
                <>
                    <Button onClick={connectWallet}>Connect Wallet</Button>
                    <div></div>
                    {availableAccounts.map((account, index) => {
                        return (
                            <>
                                <Button onClick={() => {
                                    setaccount(account)
                                }} key={index}>Select: {account}</Button>
                                <div></div>
                            </>
                        )
                    })}


                </>
            }



        </>
    )
}
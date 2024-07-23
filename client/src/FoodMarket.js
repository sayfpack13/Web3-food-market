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

function FoodCard({ image, name, price, contractAddress, seller }) {

    return (
        <Card className="food-card">
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
                        {"$"+ price || "5"}
                    </div>
                </div>
                <div className="form-label">
                    <label htmlFor="seller">Seller Address:</label>
                    <div id="seller">
                        {seller || "0xc00000000000000000000000000"}
                    </div>
                </div>
                <div className="form-label">
                    <label htmlFor="contract">Contract Address:</label>
                    <div id="contract">
                        {contractAddress || "0xc00000000000000000000000000"}
                    </div>
                </div>
            </CardContent>
            <CardActions>
                <Button variant="contained" className="info">Read More</Button>
                <IconButton className="purchase"><ShoppingCartIcon /></IconButton>
            </CardActions>
        </Card>
    )
}


export default function FoodMarket() {
    const { isLoading, setisLoading } = useContext(LoadingContext)
    const [foodList, setfoodList] = useState([])


    useEffect(() => {
        if (isLoading) {
            init()
        }
    }, [isLoading])



    const init = async () => {
        try {
            const response = await (await fetch(process.env.REACT_APP_BACKEND_URL + "/get-dbFoodList?isSold=false")).json()


        
            setfoodList(response.data)
        } catch (error) {

        }



        setisLoading(false)
    }





    return (
        <Grid container className="food-market-container" rowGap={4} columnGap={4}>
            {foodList.length!=0 && foodList.map((food, index) => {
                return (
                    <FoodCard key={index} name={food.name} price={food.price} seller={food.seller} contractAddress={food.contractAddress} />
                )
            })}
        </Grid>
    )
}
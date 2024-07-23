import { useContext, useEffect } from "react"
import { LoadingContext } from "."




function FoodCard() {

    return (
        <div className="food-card">

        </div>
    )
}


export default function FoodMarket() {
    const { isLoading, setisLoading } = useContext(LoadingContext)


    useEffect(() => {
        if (isLoading) {
            init()
        }
    }, [isLoading])



    const init = async () => {
        const data = await (await fetch(process.env.REACT_APP_BACKEND_URL + "/get-dbFoodList")).json()

        console.log(data);


        setisLoading(false)
    }





    return (
        <>
        </>
    )
}
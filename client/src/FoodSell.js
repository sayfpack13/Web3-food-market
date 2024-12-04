import detectEthereumProvider from "@metamask/detect-provider"
import { Button, TextField } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import Web3 from "web3"
import { LoadingContext } from "."
import { getUsdToEthRate } from "./utils"



export default function FoodSell() {
    const [availableAccounts, setavailableAccounts] = useState([])
    const [account, setaccount] = useState()
    const [web3, setweb3] = useState(new Web3())
    const { isLoading, setisLoading } = useContext(LoadingContext)

    const [name, setname] = useState("")
    const [price, setprice] = useState(0)

    const [usdToEthRate, setusdToEthRate] = useState(1)


    useEffect(() => {
        init()
    }, [])


    const init = async () => {
        const provider = await detectEthereumProvider()
        if (provider) {
            const web3 = new Web3(provider)

            setweb3(web3)
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



    const publishFoodNFT = async () => {
        try {

            await fetch(process.env.REACT_APP_BACKEND_URL + "/sell-food?sellerAccountAddress=" + account + "&name=" + name + "&price=" + price)

        } catch (err) {

        }
    }




    if (account) {
        return (
            <>
                <div>Connected to: {account}</div>
                <TextField
                    value={name}
                    onChange={(e) => setname(e.target.value)}
                    label="Recipe Name"
                    type="text"
                />
                <TextField
                    value={price}
                    onChange={(e) => setprice(e.target.value)}
                    label="Recipe Price"
                    type="number"
                />
                <Button onClick={publishFoodNFT}>Publish Food</Button>
                <Button onClick={disconnectWallet}>Disconnect Wallet</Button>
            </>
        )
    } else {
        return (
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
        )
    }
}
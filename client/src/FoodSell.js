import detectEthereumProvider from "@metamask/detect-provider"
import { Button } from "@mui/material"
import { useEffect, useState } from "react"
import Web3 from "web3"



export default function FoodSell() {
    const [availableAccounts, setavailableAccounts] = useState([])
    const [account, setaccount] = useState()
    const [web3, setweb3] = useState(new Web3())

    useEffect(() => {
        init()
    }, [])


    const init = async () => {
        const provider = await detectEthereumProvider()
        if (provider) {
            const web3 = new Web3(provider)

            setweb3(web3)
        }
    }


    const connectWallet = async () => {
        const accounts = await web3.eth.requestAccounts()
        setavailableAccounts(accounts)
    }





    const disconnectWallet = async () => {
        setaccount(null)
    }

    function stringToHex(str) {
        // Create a Uint8Array from the UTF-8 encoded string
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(str);

        // Convert the Uint8Array to a hex string
        return Array.from(uint8Array)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
    }


    // METHOD 1: user must pay contract transaction of NFT
    const publishFoodNFT = async () => {
        const response = await (await fetch(process.env.REACT_APP_BACKEND_URL + "/get-foodNFTConfig", {
            method: "get"
        })).json()
        const foodNFTConfig = response.data


        const contract = new web3.eth.Contract(foodNFTConfig.abi)
        const contractTx = await contract.deploy({ data: foodNFTConfig.bytecode }).send({ from: account })

        // TODO fill contract food details
        // TODO save food details in backend DB

        await fetch(process.env.REACT_APP_BACKEND_URL + "/save-foodNFT?contractAddress=" + contractTx.options.address)
    }

    // METHOD 2: backend must pay and deploy contract of Food NFT (Free NFT listing service)
    const publishFoodNFT2 = () => {
        // TODO send NFT publish request and save food details in backend DB
    }


    if (account) {
        return (
            <>
                <div>Connected to: {account}</div>
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
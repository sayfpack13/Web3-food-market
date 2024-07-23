const express = require("express")
const { Web3 } = require("web3");
const cors = require("cors")
const { db, Food, Contract } = require("./db")
const app = express()


app.use(cors())
app.use(express.json())

db.on("open", () => {
    app.listen(3000, () => {
        console.log("Server Started");
    })
})




// VARS
// constant smart contracts
const foodContractConfig = require('./build/contracts/Food.json');
// replace URL with ETH node URL or any blockchain network
const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));



// UTILS
const sendResponse = (res, data, success = true) => {
    res.status(success ? 200 : 500).json({
        data,
        success
    })
}


async function deployContract(deployerAccountAddress, contractConfig) {
    const contract = new web3.eth.Contract(contractConfig.abi)

    const deploymentTx = await contract.deploy({
        data: contractConfig.bytecode
    }).send({
        from: deployerAccountAddress,
        gas: 1000000,
        gasPrice: web3.utils.toWei('5', 'gwei')
    })

    const contractAddress = deploymentTx.options.address

    await Contract.create({
        address: contractAddress,
        created_at: new Date()
    })




    return contractAddress
}


// http://127.0.0.1:3000/deploy-foodContract?deployerAccountAddress=0x91DB4521B30bb21d1E3253B4903721fC35A1D697
app.get("/deploy-foodContract", async (req, res) => {
    try {
        const { deployerAccountAddress } = req.query


        const foodContractAddress = await deployContract(deployerAccountAddress, foodContractConfig)
        sendResponse(res, foodContractAddress)
    } catch (err) {
        sendResponse(res, "Error deploying food contract", false)
    }
})


// http://127.0.0.1:3000/get-contractFoodList?foodContractAddress=0xe6511714692e88A056AcD3fc68c42067362187B8
app.get("/get-contractFoodList", async (req, res) => {
    const { foodContractAddress } = req.query
    let contract

    try {
        contract = new web3.eth.Contract(foodContractConfig.abi, foodContractAddress)
    } catch (error) {
        sendResponse(res, "Error fetching food contract", false)
    }


    try {
        const foodItemCount = Number(await contract.methods.foodItemCount().call())
        let foodItems = []


        // smart contract food list
        foodItems = await Promise.all(
            Array.from({ length: foodItemCount }, (_, index) =>
                contract.methods.foodItems(index).call()

            )
        )

        let result = []
        for (let a = 0; a < foodItemCount; a++) {
            const foodItem = new Food({
                id: Number(foodItems[a].id),
                contractAddress: foodItems[a].contractAddress,
                name: foodItems[a].name,
                price: foodItems[a].price,
                seller: foodItems[a].seller,
                buyer: foodItems[a].buyer,
                isSold: foodItems[a].isSold
            })
            foodItem._id = null

            result.push(foodItem)
        }


        sendResponse(res,result)
    } catch (error) {
        sendResponse(res, "Error fetching food from Smart contract",false)
    }


})


// http://127.0.0.1:3000/get-dbFoodList
app.get("/get-dbFoodList", async (req, res) => {
    try {
        const foodItems = await Food.find()

        sendResponse(res, foodItems)
    } catch (error) {
        sendResponse(res, "Error fetching food DB list", false)
    }
})



// http://127.0.0.1:3000/get-foodContractList
app.get("/get-foodContractList", async (req, res) => {
    try {
        const contractList = await Contract.find()

        sendResponse(res, contractList)
    } catch (error) {
        sendResponse(res, "Error fetching food contract list", false)
    }
})




// http://127.0.0.1:3000/sell-food?sellerAccountAddress=0x91DB4521B30bb21d1E3253B4903721fC35A1D697&foodContractAddress=0xe6511714692e88A056AcD3fc68c42067362187B8&name=pizza&price=10
app.get('/sell-food', async (req, res) => {
    const { sellerAccountAddress, foodContractAddress, name, price } = req.query
    let contract

    try {
        contract = new web3.eth.Contract(foodContractConfig.abi, foodContractAddress)
    } catch (error) {
        sendResponse(res, "Error fetching food contract", false)
    }


    try {
        contract.events.FoodItemCreated().once("data", async (event) => {
            const { id } = event.returnValues


            const foodDoc = await Food.create({
                id: Number(id),
                contractAddress: foodContractAddress,
                name: name,
                price: price,
                seller: sellerAccountAddress,
                buyer: "",
                isSold: false
            })


            sendResponse(res, {
                foodDoc
            })
        })



        await contract.methods.createFoodItem(foodContractAddress, name, price).send({ from: sellerAccountAddress, gas: 1000000 })
    } catch (error) {
        sendResponse(res, "Error saving food to DB/Smart Contract", false)
    }
});
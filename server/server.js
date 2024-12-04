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
const foodContractConfig = require('./build/contracts/Food.json');
const foodContractAddress = "0x9615338d9A7BF9F2c9968cCA5AC0534F3e9A4A89"
const adminAddress = "0x91DB4521B30bb21d1E3253B4903721fC35A1D697"
// replace URL with ETH node URL or any blockchain network
const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));
const foodContract = new web3.eth.Contract(foodContractConfig.abi, foodContractAddress)


// contract food item listener
foodContract.events.FoodItemCreated().on("data", (event) => {
    const { id, price, name, seller } = event.returnValues


    // save to DB
    Food.create({
        id: Number(id),
        name: name,
        price: Number(price),
        seller: seller,
        buyer: "",
        isSold: false
    })
})


// UTILS
const sendResponse = (res, data, success = true) => {
    try {
        res.status(success ? 200 : 500).json({
            data,
            success
        })
    } catch (error) {
        // already sent ?
    }
}


// one time contract deploy
async function deployContract(deployerAccountAddress, contractConfig) {
    const contract = new web3.eth.Contract(contractConfig.abi);

    const gasEstimate = await contract.deploy({
        data: contractConfig.bytecode
    }).estimateGas({ from: deployerAccountAddress })

    const deploymentTx = await contract.deploy({
        data: contractConfig.bytecode
    }).send({
        from: deployerAccountAddress,
        gas: gasEstimate
    });

    const contractAddress = deploymentTx.options.address;
    return contractAddress;
}

// http://127.0.0.1:3000/deploy-foodContract
app.get("/deploy-foodContract", async (req, res) => {
    try {
        const foodContractAddress = await deployContract(adminAddress, foodContractConfig)
        sendResponse(res, foodContractAddress)
    } catch (err) {
        console.log(err);

        sendResponse(res, "Error deploying food contract", false)
    }
})
// one time contract deploy






// REST API
async function getContractFoodList() {
    const foodItems = await foodContract.methods.getAllFoodItems().call()

    const result = foodItems.map(item => new Food({
        id: Number(item.id),
        name: item.name,
        price: Number(item.price),
        seller: item.seller,
        buyer: item.buyer,
        isSold: item.isSold
    }))

    return result
}



// http://127.0.0.1:3000/get-contractFoodList
app.get("/get-contractFoodList", async (req, res) => {
    try {
        const result = await getContractFoodList()

        sendResponse(res, result)
    } catch (error) {
        sendResponse(res, "Error fetching food from Smart contract", false)
    }
})


// http://127.0.0.1:3000/get-dbFoodList
app.get("/get-dbFoodList", async (req, res) => {
    try {
        const { isSold } = req.query
        let foodItems

        if (isSold !== undefined) {
            foodItems = await Food.find({ isSold: isSold })
        } else {
            foodItems = await Food.find()
        }

        sendResponse(res, foodItems)
    } catch (error) {
        sendResponse(res, "Error fetching food DB list", false)
    }
})







// http://127.0.0.1:3000/sell-food?sellerAccountAddress=0x91DB4521B30bb21d1E3253B4903721fC35A1D697&name=pizza&price=10
app.get('/sell-food', async (req, res) => {
    const { sellerAccountAddress, name, price } = req.query


    try {
        const gasEstimate = await foodContract.methods.createFoodItem(sellerAccountAddress,name, price).estimateGas({ from: adminAddress })

        await foodContract.methods.createFoodItem(sellerAccountAddress,name, price).send({ from: adminAddress, gas: gasEstimate })


        sendResponse(res, "Food successfully published")
    } catch (error) {
        if (error.code == 101) {
            return sendResponse(res, "Account not recognized", false)
        }
        console.log(error);
        
        sendResponse(res, "Error saving food to DB/Smart Contract", false)
    }
});



app.get("/get-foodContract", (req, res) => {
    sendResponse(res, {
        abi:foodContractConfig.abi,
        address:foodContractAddress
    })
})
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


// http://127.0.0.1:3000/deploy-foodContract?deployerAccountAddress=0x3c5a7D252357DAE761A6f99c55fDB2e6557e30e9
app.get("/deploy-foodContract", async (req, res) => {
    try {
        const { deployerAccountAddress } = req.query


        const foodContractAddress = await deployContract(deployerAccountAddress, foodContractConfig)
        res.json({ message: "Deployed Contract Address: " + foodContractAddress })
    } catch (err) {
        res.json({ message: err })
    }
})


// http://127.0.0.1:3000/get-contractFoodList?foodContractAddress=0xF7481A31DB62dB71711B8b1f9e405860e1Bc1E1E
app.get("/get-contractFoodList", async (req, res) => {
    try {
        const { foodContractAddress } = req.query

        const contract = new web3.eth.Contract(foodContractConfig.abi, foodContractAddress)

        const foodItemCount = Number(await contract.methods.foodItemCount().call())
        let foodItems = []


        // smart contract food list
        foodItems = await Promise.all(
            Array.from({ length: foodItemCount }, (_, index) =>
                contract.methods.foodItems(index).call()

            )
        )

        let result = ""
        for (let a = 0; a < foodItemCount; a++) {
            const foodItem = new Food({
                id: Number(foodItems[a].id),
                contractAddress:foodItems[a].contractAddress,
                name: foodItems[a].name,
                price: foodItems[a].price,
                seller: foodItems[a].seller,
                buyer: foodItems[a].buyer,
                isSold: foodItems[a].isSold
            })
            foodItem._id = null

            result += JSON.stringify(foodItem)
        }

        if (result == "") {
            result = "Empty List"
        }

        res.json({ message: result })
    } catch (err) {
        res.json({ message: err })
    }
})


// http://127.0.0.1:3000/get-dbFoodList
app.get("/get-dbFoodList", async (req, res) => {
    const foodItems = await Food.find()

    res.json({ message: foodItems })
})





// http://127.0.0.1:3000/sell-food?sellerAccountAddress=0x3c5a7D252357DAE761A6f99c55fDB2e6557e30e9&foodContractAddress=0xF7481A31DB62dB71711B8b1f9e405860e1Bc1E1E&name=pizza&price=10
app.get('/sell-food', async (req, res) => {
    try {
        const { sellerAccountAddress, foodContractAddress, name, price } = req.query


        const contract = new web3.eth.Contract(foodContractConfig.abi, foodContractAddress)


        contract.events.FoodItemCreated().once("data", async (event) => {
            const { id } = event.returnValues



            const foodDoc = await Food.create({
                id: Number(id),
                contractAddress:foodContractAddress,
                name: name,
                price: price,
                seller: sellerAccountAddress,
                buyer: "",
                isSold: false
            })



            res.json({ message: 'Food created by : ' + sellerAccountAddress + " || Contract Address: " + foodContractAddress + " || Food document ID: " + foodDoc._id });
        })




        await contract.methods.createFoodItem(foodContractAddress,name, price).send({ from: sellerAccountAddress, gas: 1000000 })
    } catch (err) {
        console.log(err);
        res.json({ message: err })
    }
});
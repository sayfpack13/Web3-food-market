const express = require("express")
const { Web3 } = require("web3");
const cors = require("cors")
const { db, Food } = require("./db")
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
    })
        .send({
            from: deployerAccountAddress,
            gas: 1000000,
            gasPrice: web3.utils.toWei('5', 'gwei')
        });


    return deploymentTx.options.address;
}


// http://127.0.0.1:3000/deploy-foodContract?deployerAccountAddress=0xBe9BE1A660ab29890eB82B53F71447c2dCE2508F
app.get("/deploy-foodContract", async (req, res) => {
    try {
        const { deployerAccountAddress } = req.query


        const foodContractAddress = await deployContract(deployerAccountAddress, foodContractConfig)
        res.json({ message: "Deployed Contract Address: " + foodContractAddress })
    } catch (err) {
        res.json({ message: err })
    }
})


// http://127.0.0.1:3000/get-food?foodContractAddress=0x1F0657BdD1893F8D204aeB0B662dAe8AE8A69D21
app.get("/get-food", async (req, res) => {
    try {
        const { foodContractAddress } = req.query

        const contract = new web3.eth.Contract(foodContractConfig.abi, foodContractAddress)

        const foodItemCount = Number(await contract.methods.foodItemCount().call())
        let foodItems = []



        foodItems = await Promise.all(
            Array.from({ length: foodItemCount }, (_, index) =>
                contract.methods.foodItems(index).call()
            
            )
        )


        let result = ""
        for (let a = 0; a < foodItemCount; a++) {
            const foodItem=new Food({
                id: Number(foodItems[a].id),
                name: foodItems[a].name,
                price: foodItems[a].price,
                seller: foodItems[a].seller,
                buyer: foodItems[a].buyer,
                isSold: foodItems[a].isSold
            })
            
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



// http://127.0.0.1:3000/sell-food?sellerAccountAddress=0xBe9BE1A660ab29890eB82B53F71447c2dCE2508F&foodContractAddress=0x1F0657BdD1893F8D204aeB0B662dAe8AE8A69D21&name=pizza&price=10
app.get('/sell-food', async (req, res) => {
    try {
        const { sellerAccountAddress, foodContractAddress, name, price } = req.query


        const contract = new web3.eth.Contract(foodContractConfig.abi, foodContractAddress)




        contract.events.FoodItemCreated().once("data", async (event) => {
            const { id } = event.returnValues

  

            const foodDoc = await Food.create({
                id: Number(id),
                name: name,
                price: price,
                seller: sellerAccountAddress,
                buyer: "",
                isSold: false
            })


     
            res.json({ message: 'Food created by : ' + sellerAccountAddress + " || Contract Address: " + foodContractAddress + " || Food document ID: " + foodDoc._id });
        })




        const createTx = await contract.methods.createFoodItem(name, price)
            .send({ from: sellerAccountAddress, gas: 1000000 })
    } catch (err) {
        console.log(err);
        res.json({ message: err })
    }
});
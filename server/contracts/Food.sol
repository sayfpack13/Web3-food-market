// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Food {
    mapping(uint => FoodItem) public foodItems;
    uint public foodItemCount;
    uint[] public foodItemIds;

    struct FoodItem {
        uint id;
        string name;
        uint price;
        address payable seller;
        address buyer;
        bool isSold;
    }

    event FoodItemCreated(uint id, string name, uint price, address seller);
    event FoodItemPurchased(uint id, address buyer);

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // Modifier to restrict certain actions to the owner, if needed
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    // Function to create a new food item, accessible to anyone
    function createFoodItem(address seller, string memory _name, uint _price) public onlyOwner {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_price > 0, "Price must be greater than zero");

        foodItems[foodItemCount] = FoodItem(foodItemCount, _name, _price, payable(seller), address(0), false);
        foodItemIds.push(foodItemCount);

        emit FoodItemCreated(foodItemCount, _name, _price, seller);

        foodItemCount++;
    }

    // Payable function for a buyer to purchase a food item
    function purchaseFoodItem(uint _itemId) public payable {
        FoodItem storage item = foodItems[_itemId];

        require(item.id >= 0 && item.id < foodItemCount, "Invalid item id");
        require(!item.isSold, "Item is already sold");
        require(msg.value >= item.price, "Insufficient funds");

        item.buyer = msg.sender; // Set the buyer as the caller of this function
        item.isSold = true;

        // Transfer the funds to the seller
        item.seller.transfer(item.price);

        emit FoodItemPurchased(_itemId, msg.sender);
    }

    // Function to retrieve all food items
    function getAllFoodItems() public view returns (FoodItem[] memory) {
        FoodItem[] memory items = new FoodItem[](foodItemCount);
        for (uint i = 0; i < foodItemCount; i++) {
            items[i] = foodItems[i];
        }
        return items;
    }
}

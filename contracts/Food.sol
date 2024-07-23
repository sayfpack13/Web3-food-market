// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Food {
    struct FoodItem {
        uint id;
        string contractAddress;
        string name;
        uint price;
        address payable seller;
        address buyer;
        bool isSold;
    }

    mapping(uint => FoodItem) public foodItems;
    uint public foodItemCount;

    event FoodItemCreated(uint id,string contractAddress, string name, uint price, address seller);
    event FoodItemPurchased(uint id, address buyer);

    function createFoodItem(string memory _contractAddress,string memory _name, uint _price) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_price > 0, "Price must be greater than zero");


        foodItems[foodItemCount] = FoodItem(foodItemCount,_contractAddress, _name, _price, payable(msg.sender), address(0), false);

        emit FoodItemCreated(foodItemCount,_contractAddress, _name, _price, payable(msg.sender));

        foodItemCount++;
    }

    function purchaseFoodItem(uint _itemId) public payable {
        FoodItem storage item = foodItems[_itemId];

        require(item.id > 0 && item.id <= foodItemCount, "Invalid item id");
        require(!item.isSold, "Item is already sold");
        require(msg.value >= item.price, "Insufficient funds");

        item.buyer = msg.sender;
        item.isSold = true;
        item.seller.transfer(item.price); // Transfer the price to the seller
        emit FoodItemPurchased(_itemId, msg.sender);
    }
}

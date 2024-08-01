// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FoodNFT {
    struct FoodItem {
        string contractAddress;
        string name;
        uint price;
        address payable seller;
        address buyer;
        bool isSold;
    }

    FoodItem public foodItem;


    event FoodItemCreated(string contractAddress, string name, uint price, address seller);
    event FoodItemPurchased( address buyer);

    function createFoodItem(string memory _contractAddress,string memory _name, uint _price) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_price > 0, "Price must be greater than zero");


        foodItem = FoodItem(_contractAddress, _name, _price, payable(msg.sender), address(0), false);

        emit FoodItemCreated(_contractAddress, _name, _price, payable(msg.sender));
    }

    function purchaseFoodItem(uint _itemId) public payable {
        FoodItem storage item = foodItem;


        require(!item.isSold, "Item is already sold");
        require(msg.value >= item.price, "Insufficient funds");

        item.buyer = msg.sender;
        item.isSold = true;
        item.seller.transfer(item.price); // Transfer the price to the seller
        emit FoodItemPurchased(msg.sender);
    }
}

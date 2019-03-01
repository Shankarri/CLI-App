var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require("console.table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId);
    itemsDisplay();
});

let itemsDisplay = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        var values = [];
        for (var index in res) {
            values.push([' ', res[index].item_id, res[index].product_name, res[index].price]);
        }
        console.log("\n ")
        console.table([' ', 'Product Id', 'Product Name', 'Price'], values);
        getUserInput(res);
    });
}

let getUserInput = function (prodDetails) {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter the product ID you want to buy?",
            name: "prodId"
        },
        {
            type: "input",
            message: "How many units do you want to buy?",
            name: "numItems"
        },
        {
            type: "confirm",
            message: "Are you sure? ",
            name: "confirm",
            default: true
        }])
        .then(function (inquirerResponse) {
            if (inquirerResponse.confirm) {
                console.log("\n Loading ........\n");
                var foundprod = false;
                var userProd;
                var numItems = parseInt(inquirerResponse.numItems);
                var productId = parseInt(inquirerResponse.prodId);
                if (numItems == inquirerResponse.numItems && productId == inquirerResponse.prodId) {
                    for (var index in prodDetails) {
                        if (prodDetails[index].item_id == productId) {
                            foundprod = true;
                            userProd = prodDetails[index];
                            break;
                        }
                    }
                    if (foundprod) {
                        // console.log("\n ------ Found your product -------\n");
                        // console.log("\n \n",  userProd);
                        if (numItems >= userProd.stock_quantity) {
                            console.log("\n **  Insufficient quantity!! We don't have " + numItems + " units of the product in stock for this product. ** \n");
                            connection.end();
                        }
                        else {
                            console.log("\n Updating your Purchase Order");
                            var stockLeftAfterOrder = userProd.stock_quantity - numItems;
                            placeOrder(userProd.item_id, stockLeftAfterOrder);
                            console.log("\n *** Total Cost of the purchase : \t", numItems * userProd.price);
                        }
                    }
                    else {
                        console.log("\n *** Entered Product id is not present  *** \n");
                        connection.end();
                    }
                }
                else {
                    console.log("\n *** Please enter correct numbers for Product Id and Stock Quantity \n");
                    connection.end();
                }
            }
            else {
                console.log("\n Come back Soon !! Run the app again if you wish to buy products\n");
                connection.end();
            }
        });

}

function placeOrder(prodId, stock_left) {
    var query = connection.query(
        "UPDATE products SET ? WHERE ?;",
        [
            {
                stock_quantity: stock_left,
            },
            {
                item_id: prodId,
            }
        ],
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.end();
}

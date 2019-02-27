var mysql = require("mysql");
var inquirer = require("inquirer");

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
        // console.log(res);
        for (var index in res) {
            console.log("\n Product Id : \t" + res[index].item_id +
                "\t Price : " + res[index].price +
                "\t\t Product Name : " + res[index].product_name);
        }
        console.log("\n");
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
            message: "Are you sure:",
            name: "confirm",
            default: true
        }])
        .then(function (inquirerResponse) {
            if (inquirerResponse.confirm) {
                console.log("\n Loading ........\n");
                var foundprod = false;
                var userProd;
                var numItems =parseInt(inquirerResponse.numItems);
                for (var index in prodDetails) {
                    if (prodDetails[index].item_id == parseInt(inquirerResponse.prodId)) {
                        foundprod = true;
                        userProd = prodDetails[index];
                        break;
                    }
                }
                if (foundprod) {
                    console.log("\n ------ Found your product -------\n");
                    // console.log("\n \n",  userProd);
                    if (numItems >= userProd.stock_quantity) {
                        console.log("\n **  Insufficient quantity!! We don't have " + numItems + " units of the product in stock for this product. ** \n");
                        connection.end();
                    }
                    else {
                        console.log("\n updating database");
                        var stockLeftAfterOrder = userProd.stock_quantity - numItems;
                        placeOrder(userProd.item_id, stockLeftAfterOrder);
                        console.log("\n *** Total Cost of the purchase : \n", numItems * userProd.price);
                    }
                }
                else {
                    console.log("\n *** Entered Product id is not present  *** \n");
                    connection.end();
                }
            }
            else {
                console.log("\n Come back Soon !! Run the app again if you wish buy products\n");
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

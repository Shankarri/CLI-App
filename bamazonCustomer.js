
// Initialize all the dependent packages
var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require("console.table");

// Setup the mysql connection to connect to the database.
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

// Make connection and if there is error in connection, then display 
connection.connect(function (err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId);
    itemsDisplay();
});

// As soon as the app is run, show the product details from the database to the customer.
let itemsDisplay = function () {
    //Run query to fetch all the details from Products table 
    connection.query("SELECT * FROM products", function (err, res) {
        // If there is error in running the products, then show error
        if (err) throw err;
        var values = [];
        // Loop through results of the database query and push the results into Values array
        for (var index in res) {
            values.push([' ', res[index].item_id, res[index].product_name, res[index].price]);
        }
        console.log("\n ")
        // Use the table package to display the Product details in the table format.
        console.table([' ', 'Product Id', 'Product Name', 'Price'], values);
        // After displaying, ask user for order details
        getUserInput(res);
    });
}

// Getting Product Id and number of items for placing the order for the user.
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
            // If the user confirm to proceed further, then proceed with error checks
            if (inquirerResponse.confirm) {
                console.log("\n Loading ........\n");
                var foundprod = false;
                var userProd;
                var numItems = parseInt(inquirerResponse.numItems.trim());
                var productId = parseInt(inquirerResponse.prodId.trim());

                // Check if the user has entered number for product Id and number of items
                if (numItems == inquirerResponse.numItems.trim() && productId == inquirerResponse.prodId.trim()) {
                    // Check the product details from the database fetching, for the user entered product Id 
                    for (var index in prodDetails) {
                        if (prodDetails[index].item_id == productId) {
                            foundprod = true;
                            userProd = prodDetails[index];
                            break;
                        }
                    }
                    // If the user has correctly entered the product ID from the product list
                    if (foundprod) {
                        // If the user entered quantity is not available in bamazon then display error message
                        if (numItems >= userProd.stock_quantity) {
                            console.log("\n **  Insufficient quantity!! We don't have " + numItems + " units of the product in stock for this product. ** \n");
                            connection.end();
                        }
                        // If the user entered quantity is available in bamazon 
                        else {
                            console.log("\n Updating your Purchase Order");
                            var stockLeftAfterOrder = userProd.stock_quantity - numItems;
                            // update the stock quantity in database
                            placeOrder(userProd.item_id, stockLeftAfterOrder);
                            // Display the total cost of thier purchase
                            console.log("\n *** Total Cost of the purchase : \t", numItems * userProd.price);
                        }
                    }
                    // Check if the user entered product Id is not in the list
                    else {
                        console.log("\n *** Entered Product id is not present  *** \n");
                        connection.end();
                    }
                }
                // Check if the user has entered is not integer then display error message
                else {
                    console.log("\n *** Please enter correct numbers for Product Id and Stock Quantity \n");
                    connection.end();
                }
            }
            // If user do not want to proceed in placing order, then display message
            else {
                console.log("\n Come back Soon !! Run the app again if you wish to buy products\n");
                connection.end();
            }
        });

}

// Get the product Id and stock from the user input and update the products table
function placeOrder(prodId, stock_left) {
    connection.query(
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

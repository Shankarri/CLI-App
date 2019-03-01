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
});
var managerActionDone = false;

var choices = [
    {
        name: "1. View Products for Sale",
        value: 1
    },
    {
        name: "2. View Low Inventory",
        value: 2
    },
    {
        name: "3. Add to Inventory",
        value: 3
    },
    {
        name: "4. Add New Product",
        value: 4
    }
];

// As soon as the app is run, show the Manager with four options and let him choose one
inquirer.prompt([
    {
        type: 'list',
        name: 'menuOptions',
        message: 'List a set of menu options:',
        choices: choices
    }])
    .then(function (inquirerResponse) {
        // According to the choice pass the correct values to the view Products fucntions
        switch (inquirerResponse.menuOptions) {
            case 1: return viewProducts("showAllProducts");
            case 2: return viewProducts("showlowStock");
            case 3: return viewProducts("addStocktoProduct");
            case 4: return viewProducts("addNewProduct");
        }
    });

// Display the products details in the terminal 
let viewProducts = function (managerAction) {

    var displayMsg = "**** List of Products";
    // Have a query ready to fetch all product details from products table
    var prodQuery = "SELECT * FROM products";

    // If manager selects, view low inventory option then fetch only prodcut details with stock less than 5 
    if (managerAction == "showlowStock") {
        prodQuery += " WHERE stock_quantity < 5";
        displayMsg += " with stock below 5";
        managerActionDone = true;
    }

    else if (managerAction == "showAllProducts") {
        managerActionDone = true;
    }

    connection.query(prodQuery, function (err, res) {
        // If there is error in running the products, then show error
        if (err) throw err;
        console.log("\n" + displayMsg + "\n");
        var values = [];
        // Loop through results of the database query and push the results into Values array
        for (var index in res) {
            values.push([" ", res[index].item_id, res[index].product_name, res[index].price, res[index].stock_quantity]);
        }
        // Use the table package to display the Product details in the table format.
        console.table([' ', 'Product Id', 'Product Name', 'Price', 'Stock Quantity'], values);

        // If user wants to add stock to avaiable product
        if (managerAction == "addStocktoProduct") getManagerInput(res);
        // If user wants to add a new product
        else if (managerAction == "addNewProduct") getNewProdcutDetails();
    });
    // IF the manager has finished all actions, then end connection
    if (managerActionDone) {
        connection.end();
    }
}

// Prompt the manager to enter the product id and number of stock to add
let getManagerInput = function (prodDetails) {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter the product ID to add stock for it :",
            name: "prodId"
        },
        {
            type: "input",
            message: "How many units do you want to add?",
            name: "numItems"
        },
        {
            type: "confirm",
            message: "Are you sure:",
            name: "confirm",
            default: true
        }])
        .then(function (inquirerResponse) {
            // If the user confirm to proceed further, then proceed with error checks
            if (inquirerResponse.confirm) {
                console.log("\n Loading ........\n");
                var foundprod = false;
                var userProd;
                var productId = parseInt(inquirerResponse.prodId);
                var numItems = parseInt(inquirerResponse.numItems);

                // Check if the user has entered number for product Id and number of items
                if (numItems == inquirerResponse.numItems && productId == inquirerResponse.prodId) {
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
                        var stockLeftAfteradding = userProd.stock_quantity + numItems;
                        // update the stock quantity in database
                        updateProduct(userProd.item_id, stockLeftAfteradding);
                    }
                    // Check if the user entered product Id is not in the list
                    else {
                        console.log("\n *** Entered Product id is not present *** \n");
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
                console.log("\n  *** Come back Soon !! \n");
                connection.end();
            }
        });
}

// Get the product Id and stock from the Manager input and update the products table
function updateProduct(prodId, stock) {
    connection.query(
        "UPDATE products SET ? WHERE ?;",
        [
            {
                stock_quantity: stock,
            },
            {
                item_id: prodId,
            }
        ],
        function (err, res) {
            if (err) throw err;
        }
    );
    // after increasing the stock show them in the page
    viewProducts("showAllProducts");

}
// Getting new Product details from the manager
let getNewProdcutDetails = function () {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter Product Name :",
            name: "prodName"
        },
        {
            type: "input",
            message: "Enter Product Department : ",
            name: "dept"
        },
        {
            type: "input",
            message: "Enter Product Price : ",
            name: "price"
        },
        {
            type: "input",
            message: "Enter Stock Quantity for the product : ",
            name: "stock_quantity"
        },
        {
            type: "confirm",
            message: "Are you sure?  ",
            name: "confirm",
            default: true
        }
    ])
        .then(function (inquirerResponse) {
            // If the user confirm to proceed further, then proceed with error checks
            if (inquirerResponse.confirm) {
                var prodPrice = parseFloat(inquirerResponse.price);
                var stock = parseInt(inquirerResponse.stock_quantity);
                // Check if the user has entered number for product Id and number of items
                if (prodPrice == inquirerResponse.price && stock == inquirerResponse.stock_quantity) {
                    // Update the product details table with the new product details 
                    addToInventory(inquirerResponse.prodName, inquirerResponse.dept, prodPrice, stock);
                }
                // Check if the user has entered is not integer then display error message
                else {
                    console.log("\n *** Please enter numbers for Product Price and Stock Quantity \n");
                    connection.end();
                }
            }
            // If user do not want to proceed in placing order, then display message
            else {
                console.log("\n Come Again  !!\n");
                connection.end();
            }
        });
}

// Get the new product Details from the Manager input and update the products table
function addToInventory(prodName, department, price, stock) {
    connection.query(
        "INSERT INTO products SET ?",
        {
            product_name: prodName,
            department_name: department,
            price: price,
            stock_quantity: stock
        },
        function (err, res) {
            console.log(res.affectedRows + " product added to Inventory\n");
            // after adding the details show them in the page
            viewProducts("showAllProducts");
        }
    );
}

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


inquirer.prompt([
    {
        type: 'list',
        name: 'menuOptions',
        message: 'List a set of menu options:',
        choices: choices
    }])
    .then(function (inquirerResponse) {
        // console.log(inquirerResponse.menuOptions);
        switch (inquirerResponse.menuOptions) {
            case 1: return viewProducts("showAllProducts");
            case 2: return viewProducts("showlowStock");
            case 3: return viewProducts("addStocktoProduct");
            case 4: return viewProducts("addNewProduct");
            default: return errorMsg();
        }
    });

let viewProducts = function (managerAction) {

    var displayMsg = "**** List of Products";
    var prodQuery = "SELECT * FROM products";

    if (managerAction == "showlowStock") {
        prodQuery += " WHERE stock_quantity < 5";
        displayMsg += " with stock below 5";
        managerActionDone = true;
    }
    else if (managerAction == "showAllProducts") {
        managerActionDone = true;
    }

    connection.query(prodQuery, function (err, res) {
        if (err) throw err;
        console.log("\n" + displayMsg + "\n");
        var values = [];
        for (var index in res) {
            values.push([" ", res[index].item_id, res[index].product_name, res[index].price, res[index].stock_quantity]);
        }
        console.table([' ', 'Product Id', 'Product Name', 'Price', 'Stock Quantity'], values);
        if (managerAction == "addStocktoProduct") getManagerInput(res);
        else if (managerAction == "addNewProduct") getNewProdcutDetails();
    });

    if (managerActionDone) {
        connection.end();
    }
}

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

            if (inquirerResponse.confirm) {
                console.log("\n Loading ........\n");
                var foundprod = false;
                var userProd;
                var productId = parseInt(inquirerResponse.prodId);
                var numItems = parseInt(inquirerResponse.numItems);
                if (numItems == inquirerResponse.numItems && productId == inquirerResponse.prodId) {
                    for (var index in prodDetails) {
                        if (prodDetails[index].item_id == productId) {
                            foundprod = true;
                            userProd = prodDetails[index];
                            break;
                        }
                    }
                    if (foundprod) {

                        var stockLeftAfteradding = userProd.stock_quantity + numItems;
                        updateProduct(userProd.item_id, stockLeftAfteradding);
                    }
                    else {
                        console.log("\n *** Entered Product id is not present *** \n");
                        connection.end();
                    }
                }
                else {
                    console.log("\n *** Please enter correct numbers for Product Id and Stock Quantity \n");
                    connection.end();
                }
            }
            else {
                console.log("\n  *** Come back Soon !! \n");
                connection.end();
            }
        });
}


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
    viewProducts("showAllProducts");

}

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
            var prodPrice = parseFloat(inquirerResponse.price);
            var stock = parseInt(inquirerResponse.stock_quantity);
            if (prodPrice == inquirerResponse.price && stock == inquirerResponse.stock_quantity) {
                if (inquirerResponse.confirm) {
                    // console.log("Your bid will be added!\n");
                    addToInventory(inquirerResponse.prodName, inquirerResponse.dept, prodPrice, stock);
                }
                else {
                    console.log("\n Come Again  !!\n");
                    connection.end();
                }

            }
            else {
                console.log("\n *** Please enter numbers for Product Price and Stock Quantity \n");
                connection.end();
            }
        });
}

function addToInventory(prodName, department, price, stock) {
    // console.log("\n Inserting a new item");
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
            viewProducts("showAllProducts");
        }
    );
}

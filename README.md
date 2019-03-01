# CLI-App

*  CLI App will be a command line node app which will allow customers to view the products avaialble in the bamazon and also place an order for any available products

* This product also allows Managers 
    1. View Products for Sale
    2. View Low Inventory
    3. Add to Inventory
    4. Add New Product
________________________________________
 
 ## Initial setup

 * Clone the files to your system

 * Go to your terminal and enter below commands to install all the dependent packages

```
* npm install mysql
* npm install inquirer
* npm install console.table
```
________________________________________

## Customer View

* Command --  node bamazonCustomer

* Once the command is entered, all the products that are available in the bamazon will be displayed.

* Enter the product Id from the displyed Products list and number of units that you need.

* If you do not want to continue, then press No. This will exit the application.

* Screenshot : ![Customer](images/0_customer.PNG)

* If you want to continue, then press Yes or Y. This will  place an order in the bamazon and your Total Cost of the purchase will be displayed in the terminal. 

* Screenshot : ![Customer](images/1_customer.PNG)

* If number of units of the selected product is not in stock then it will display Insufficient quantity message.

* Screenshot: ![Customer](images/2_customer.PNG)

________________________________________

### Error Scenario's:


1. If the user entered Product Id is not present in bamazon, then display error message.

* Screenshot : ![Customer](images/1_ErrorMsg_customer.PNG)

2. If the user entered Product Id or Number of items are not correct, then display error message.

* Screenshot :
 ![Customer](images/2_ErrorMsg_customer.PNG)
 ![Customer](images/3_ErrorMsg_customer.PNG)

________________________________________


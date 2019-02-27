DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name  VARCHAR(1000) Not NULL,
  department_name VARCHAR(1000),
  price  DECIMAL(10,2) Not NULL,
  stock_quantity INT,
  PRIMARY KEY (item_id)
);

Insert into products (product_name,department_name, price, stock_quantity)
values ("Samsung Galaxy Watch","Smart Watch", 300, 30);

Insert into products (product_name,department_name, price, stock_quantity)
values ("Fitbit Versa Smart Watch","Smart Watch", 198.95, 12);

Insert into products (product_name,department_name, price, stock_quantity)
values ("Motorola X4","Smart Phone", 349.99, 80);

Insert into products (product_name,department_name, price, stock_quantity)
values ("Apple iPhone 6","Smart Phone", 164.97, 20);

Insert into products (product_name,department_name, price, stock_quantity)
values ("Lenovo Chromebook C330","Laptop", 229.29, 135);

Insert into products (product_name,department_name, price, stock_quantity)
values ("Dell 14' 3350 Notebook","Laptop", 247.99, 40);

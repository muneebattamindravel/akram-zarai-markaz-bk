const moment = require('moment')
const sequelize = require('../models').sequelize;
const Accounts = require('../controllers/accounts.controller');
const Contacts = require('../controllers/contacts.controller');
const productstocks = require('../controllers/productStocks.controller');
const Companies = require('../controllers/companies.controller');

/**DB Querries*/ 
const RunMigration = async (req, res) => {
    try {
        //FIX EMPTY / NULL DATE ISSUE
        // sequelize.query("SET sql_mode = ''");

        var createdAt = moment().format('YYYY-MM-DD hh:mm:ss')
        var updatedAt = moment().format('YYYY-MM-DD hh:mm:ss')

        await sequelize.query("SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));");
        // USERS
        await sequelize.query("INSERT INTO `users` (`id`, `username`, `password`, `createdAt`, `updatedAt`) VALUES (NULL, 'akram', 'akram', '"+createdAt+"', '"+updatedAt+"');");

        // CATEGORIES
        var preQuery = "INSERT INTO `categories` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, ";

        await sequelize.query(preQuery + "'Pesticides', 'All Pesticides Medicines', '"+createdAt+"', '"+updatedAt+"');");
        await sequelize.query(preQuery + "'Insecticides', 'All Insecticides Medicines', '"+createdAt+"', '"+updatedAt+"');");
        await sequelize.query(preQuery + "'Seeds', 'All Types Of Seeds', '"+createdAt+"', '"+updatedAt+"');");
        await sequelize.query(preQuery + "'Fungicides', 'All Fungicides Medicines', '"+createdAt+"', '"+updatedAt+"');");
        await sequelize.query(preQuery + "'Herbicides', 'All Herbicides Medicines', '"+createdAt+"', '"+updatedAt+"');");

        // //UNITS
        var preQuery = "INSERT INTO `units` (`id`, `name`, `description`,  `createdAt`, `updatedAt`, `allowDecimal`) VALUES (NULL, ";

        await sequelize.query(preQuery + "'Pack', 'Packet',  '"+createdAt+"', '"+updatedAt+"', 0);");
        await sequelize.query(preQuery + "'Bottle', 'Bottle',  '"+createdAt+"', '"+updatedAt+"', 0);");
        await sequelize.query(preQuery + "'KG', 'Kilogram',  '"+createdAt+"', '"+updatedAt+"', 1);");
        await sequelize.query(preQuery + "'G', 'Gram',  '"+createdAt+"', '"+updatedAt+"', 1);");
        await sequelize.query(preQuery + "'L', 'Litre',  '"+createdAt+"', '"+updatedAt+"', 1);");
        await sequelize.query(preQuery + "'ML', 'MilliLitre',  '"+createdAt+"', '"+updatedAt+"', 1);");

        // ACCOUNTS
        await Accounts.createAccountDBMigration(new Date("03-01-2022"), "Madina Chowk Cash", "", "Cash", 0.00, 0, "","", true);
        
        // await Accounts.createAccountDBMigration(new Date("01-01-2022"), "Akram Khan BOP", "", "Online", 0.00, 0, "Bank Of Punjab","001024457812", false);
        // await Accounts.createAccountDBMigration(new Date("01-01-2022"), "Akram Khan HBL", "", "Online", 0.00, 0, "Habib Bank","24447000417403", false);


        return;
        //COMPANIES 
        await Companies.createCompanyDBMigration("Bayer", "", ""); 
        await Companies.createCompanyDBMigration("Technofarm", "", ""); 
        await Companies.createCompanyDBMigration("Green Agro", "", ""); 
        await Companies.createCompanyDBMigration("Jaffer", "", ""); 
        await Companies.createCompanyDBMigration("Exert Chemicals", "", ""); 
        await Companies.createCompanyDBMigration("All Seeds", "", ""); 

        // //SUPLLIERS
        await Contacts.createContactDBMigration('Supplier', 'Green Agro Supplier', '', '', '', '', '', createdAt, updatedAt);
        await Contacts.createContactDBMigration('Supplier', 'Bayer Supplier', '', '', '', '', '', createdAt, updatedAt);
        await Contacts.createContactDBMigration('Supplier', 'Technofarm Supplier', '', '', '', '', '', createdAt, updatedAt);
        await Contacts.createContactDBMigration('Supplier', 'Jaffer Supplier', '', '', '', '', '', createdAt, updatedAt);
        await Contacts.createContactDBMigration('Supplier', 'Exert Chemicals Supplier', '', '', '', '', '', createdAt, updatedAt);

        // //CUSTOMERS
        await Contacts.createContactDBMigration('Customer', 'Sameed Atta Khan', '', '03454442224', '', '', '', 2000);
        
        // //PRODUCTS
        //Bayer - 1, Technofarm - 2, Green Agro - 3, Jaffer - 4, Exert Chemicals - 5, All Seeds - 6
        var preQuery = "INSERT INTO `products` (`id`, `name`, `salePrice`, `description`, `alertQuantity`, `imageURL`, `nextLotNumber`, `createdAt`, `updatedAt`, `companyId`, `categoryId`, `unitId`) VALUES (NULL,";

        await sequelize.query(preQuery + "'Amizon Plus', 1100.00, '', 5.00, 'ProductImage-Amizon Plus-1', '1', '"+createdAt+"', '"+updatedAt+"', '2', '2', '2');");
        await productstocks.createproductstockWorker(1, 1070.00, "GG-2021-802", "Inv-001", null, 100.00, "",new Date("12-12-2022"));

        await sequelize.query(preQuery + "'Grostar', 380.00, '', 5.00, 'ProductImage-Grostar-2', '1', '"+createdAt+"', '"+updatedAt+"', '3', '2', '2');");
        await productstocks.createproductstockWorker(2, 322.00, "GG-2021-2701", "Inv-001", null, 15.00, "", new Date("12-12-2022"));

        await sequelize.query(preQuery + "'Green Grow XL', 340.00, '', 5.00, 'ProductImage-Green Grow XL-3', '1', '"+createdAt+"', '"+updatedAt+"', '3', '2', '2');");
        await productstocks.createproductstockWorker(3, 280.00, "GG-2021-2902", "Inv-001", null, 23.00, "", new Date("12-12-2022"));

        await sequelize.query(preQuery + "'Adazin', 512.00, '', 5.00, 'ProductImage-Adazin-4', '1', '"+createdAt+"', '"+updatedAt+"', '2', '5', '2');");
        await productstocks.createproductstockWorker(4, 462.00, "GG-2021-2902", "Inv-001", null, 50.00, "", new Date("12-12-2022"));

        await sequelize.query(preQuery + "'Shaowang', 1570.00, '', 5.00, 'ProductImage-Shaowang-5', '1', '"+createdAt+"', '"+updatedAt+"', '2', '5', '2');");
        await productstocks.createproductstockWorker(5, 462.00, "GG-2021-103", "Inv-001", null, 20.00, "", new Date("12-12-2022"));

        await sequelize.query(preQuery + "'Haper', 970.00, '', 5.00, 'ProductImage-Haper-6', '1', '"+createdAt+"', '"+updatedAt+"', '2', '2', '2');");
        await productstocks.createproductstockWorker(6, 880.00, "GG-2021-501", "Inv-001", null, 5.00, "", new Date("12-12-2022"));
        
        await sequelize.query(preQuery + "'Nighedasht', 1035.00, '', 5.00, 'ProductImage-Nighedasht-7', '1', '"+createdAt+"', '"+updatedAt+"', '2', '2', '2');");

        await sequelize.query(preQuery + "'Zyrate', 1270.00, '', 5.00, 'ProductImage-Zyrate-8', '1', '"+createdAt+"', '"+updatedAt+"', '2', '4', '1');");
        await productstocks.createproductstockWorker(8, 998.00, "GG-2021-702", "Inv-001", null, 5.00, "", new Date("12-12-2022"));

        await sequelize.query(preQuery + "'Fact', 520.00, '', 5.00, 'ProductImage-Fact-9', '1', '"+createdAt+"', '"+updatedAt+"', '3', '4', '1');");
        await productstocks.createproductstockWorker(9, 443.00, "GG-2021-1402", "Inv-001", null, 50.00, "", new Date("12-12-2022"));

        await sequelize.query(preQuery + "'Monocil', 550.00, '', 5.00, 'ProductImage-Monocil-10', '1', '"+createdAt+"', '"+updatedAt+"', '2', '4', '1');");
        await productstocks.createproductstockWorker(10, 485.00, "GG-2021-903", "Inv-001", null, 32.00, "", new Date("12-12-2022"));

        await sequelize.query(preQuery + "'Bajra', 110.00, '', 5.00, 'ProductImage-Bajra-11', '1', '"+createdAt+"', '"+updatedAt+"', '6', '3', '3');");
        await productstocks.createproductstockWorker(11, 100.00, "", "Inv-001", null, 50.00, "", new Date("12-12-2022"));
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = {
    RunMigration
}
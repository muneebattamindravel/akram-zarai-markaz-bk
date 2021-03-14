const moment = require('moment')
;const sequelize = require('../models').sequelize;
/**DB Querries*/ 
const RunMigration = async (req, res) => {
    try {
        //FIX EMPTY / NULL DATE ISSUE
        //sequelize.query("SET sql_mode = ''");

        var createdAt = moment().format('YYYY-MM-DD hh:mm:ss')
        var updatedAt = moment().format('YYYY-MM-DD hh:mm:ss')

        console.log("Created At = "+createdAt);
        // USERS
        sequelize.query("INSERT INTO `users` (`id`, `username`, `password`, `createdAt`, `updatedAt`) VALUES (NULL, 'akram', 'akram', '"+createdAt+"', '"+updatedAt+"');");

        // CATEGORIES
        sequelize.query("INSERT INTO `categories` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Pesticides', 'All Pesticides Medicines', '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `categories` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Seeds', 'All Types Of Seeds', '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `categories` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Fungicides', 'All Fungicides Medicines', '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `categories` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Herbicides', 'All Herbicides Medicines', '"+createdAt+"', '"+updatedAt+"');");

        //COMPANIES
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Arysta', '', '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Bayer', '', '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Technofarm', '', '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Zeangbang', '', '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Target', '', '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Jaffer', '', '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'All Seeds', '', '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Bajra Seeds', '', '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Jowar Seeds', '', '"+createdAt+"', '"+updatedAt+"');");

        // //UNITS
        sequelize.query("INSERT INTO `units` (`id`, `name`, `description`,  `createdAt`, `updatedAt`) VALUES (NULL, 'Pack', 'Packet',  '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `units` (`id`, `name`, `description`,  `createdAt`, `updatedAt`) VALUES (NULL, 'Kg', 'Kilogram',  '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `units` (`id`, `name`, `description`,  `createdAt`, `updatedAt`) VALUES (NULL, 'G', 'Gram',  '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `units` (`id`, `name`, `description`,  `createdAt`, `updatedAt`) VALUES (NULL, 'L', 'Litre',  '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `units` (`id`, `name`, `description`,  `createdAt`, `updatedAt`) VALUES (NULL, 'ML', 'MilliLitre',  '"+createdAt+"', '"+updatedAt+"');");

        // //SUPLLIERS
        sequelize.query("INSERT INTO `contacts` (`id`, `type`, `name`, `businessName`, `number`, `email`, `address`, `notes`, `createdAt`, `updatedAt`) VALUES (NULL, 'supplier', 'Arysta Supplier', '', '', '', '', '', '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `contacts` (`id`, `type`, `name`, `businessName`, `number`, `email`, `address`, `notes`, `createdAt`, `updatedAt`) VALUES (NULL, 'supplier', 'Bayer Supplier', '', '', '', '', '', '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `contacts` (`id`, `type`, `name`, `businessName`, `number`, `email`, `address`, `notes`, `createdAt`, `updatedAt`) VALUES (NULL, 'supplier', 'Technofarm Supplier', '', '', '', '', '', '"+createdAt+"', '"+updatedAt+"');");
        sequelize.query("INSERT INTO `contacts` (`id`, `type`, `name`, `businessName`, `number`, `email`, `address`, `notes`, `createdAt`, `updatedAt`) VALUES (NULL, 'supplier', 'Zeangbang Supplier', '', '', '', '', '', '"+createdAt+"', '"+updatedAt+"');");

        // //PRODUCTS
        sequelize.query("INSERT INTO `products` (`id`, `name`, `salePrice`, `description`, `alertQuantity`, `imageURL`, `nextLotNumber`, `createdAt`, `updatedAt`, `companyId`, `categoryId`, `unitId`) VALUES (NULL, 'Antracool 1 kg', 0.00, '', 5.00, '', '1', '"+createdAt+"', '"+updatedAt+"', '2', '1', '2');");
        sequelize.query("INSERT INTO `products` (`id`, `name`, `salePrice`, `description`, `alertQuantity`, `imageURL`, `nextLotNumber`, `createdAt`, `updatedAt`, `companyId`, `categoryId`, `unitId`) VALUES (NULL, 'Sulphite 1 Kg', 0.00, '', 5.00, '', '1', '"+createdAt+"', '"+updatedAt+"', '2', '1', '1');");

        // ACCOUNTS
        
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = {
    RunMigration
}
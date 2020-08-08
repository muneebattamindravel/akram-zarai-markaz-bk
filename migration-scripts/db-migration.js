
const sequelize = require('../models').sequelize;
/**DB Querries*/ 
const RunMigration = async (req, res) => {
    try {
        // CATEGORIES
        sequelize.query("INSERT INTO `categories` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Pesticides', 'All Pesticides Medicines', '', '');");
        sequelize.query("INSERT INTO `categories` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Seeds', 'All Types Of Seeds', '', '');");
        sequelize.query("INSERT INTO `categories` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Fungicides', 'All Fungicides Medicines', '', '');");
        sequelize.query("INSERT INTO `categories` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Herbicides', 'All Herbicides Medicines', '', '');");

        //COMPANIES
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Arysta', '', '', '');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Bayer', '', '', '');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Technofarm', '', '', '');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Zeangbang', '', '', '');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Target', '', '', '');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Jaffer', '', '', '');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'All Seeds', '', '', '');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Bajra Seeds', '', '', '');");
        sequelize.query("INSERT INTO `companies` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES (NULL, 'Jowar Seeds', '', '', '');");

        //UNITS
        sequelize.query("INSERT INTO `units` (`id`, `name`, `description`, `allowDecimal`, `createdAt`, `updatedAt`) VALUES (NULL, 'Pack', 'Packet', '0', '', '');");
        sequelize.query("INSERT INTO `units` (`id`, `name`, `description`, `allowDecimal`, `createdAt`, `updatedAt`) VALUES (NULL, 'Kilogram', 'Kilogram', '0', '', '');");
        sequelize.query("INSERT INTO `units` (`id`, `name`, `description`, `allowDecimal`, `createdAt`, `updatedAt`) VALUES (NULL, 'Gram', 'Gram', '0', '', '');");
        sequelize.query("INSERT INTO `units` (`id`, `name`, `description`, `allowDecimal`, `createdAt`, `updatedAt`) VALUES (NULL, 'Litre', 'Litre', '0', '', '');");
        sequelize.query("INSERT INTO `units` (`id`, `name`, `description`, `allowDecimal`, `createdAt`, `updatedAt`) VALUES (NULL, 'MilliLitre', 'MilliLitre', '0', '', '');");

        //SUPLLIERS
        sequelize.query("INSERT INTO `contacts` (`id`, `type`, `name`, `businessName`, `number`, `email`, `address`, `notes`, `createdAt`, `updatedAt`) VALUES (NULL, 'supplier', 'Arysta Supplier', NULL, NULL, NULL, NULL, NULL, '', '');");
        sequelize.query("INSERT INTO `contacts` (`id`, `type`, `name`, `businessName`, `number`, `email`, `address`, `notes`, `createdAt`, `updatedAt`) VALUES (NULL, 'supplier', 'Bayer Supplier', NULL, NULL, NULL, NULL, NULL, '', '');");
        sequelize.query("INSERT INTO `contacts` (`id`, `type`, `name`, `businessName`, `number`, `email`, `address`, `notes`, `createdAt`, `updatedAt`) VALUES (NULL, 'supplier', 'Technofarm Supplier', NULL, NULL, NULL, NULL, NULL, '', '');");
        sequelize.query("INSERT INTO `contacts` (`id`, `type`, `name`, `businessName`, `number`, `email`, `address`, `notes`, `createdAt`, `updatedAt`) VALUES (NULL, 'supplier', 'Zeangbang Supplier', NULL, NULL, NULL, NULL, NULL, '', '');");

        //PRODUCTS
        sequelize.query("INSERT INTO `products` (`id`, `name`, `salePrice`, `description`, `alertQuantity`, `currentStock`, `imageURL`, `nextLotNumber`, `createdAt`, `updatedAt`, `companyId`, `categoryId`, `unitId`) VALUES (NULL, 'Antracool 1 kg', NULL, NULL, '5', '0.00', NULL, '1', '', '', '2', '1', '2');");
        sequelize.query("INSERT INTO `products` (`id`, `name`, `salePrice`, `description`, `alertQuantity`, `currentStock`, `imageURL`, `nextLotNumber`, `createdAt`, `updatedAt`, `companyId`, `categoryId`, `unitId`) VALUES (NULL, 'Acephate 660 Gram', NULL, NULL, '5', '0.00', NULL, '1', '', '', '2', '1', '2');");
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = {
    RunMigration
}
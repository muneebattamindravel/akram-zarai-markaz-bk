const CONTACTS_STRINGS = require('../constants/contacts.strings')
const Contacts = require('../models/contacts.model')
const AccountsModel = require('../models/accounts.model')
const accounttransactionsModel = require('../models/accountTransactions.model')
const AccountsController = require('../controllers/accounts.controller');
const accounttransactionsController = require('./accountTransactions.controller');

/**creates a new contact */
const createContact = async (req, res) => {
    try {
        if (!IsContactBodyValid(req.body, res))
            return;
        const contact = await Contacts.create({
            type: req.body.type,
            name: req.body.name,
            businessName: req.body.businessName,
            number: req.body.number,
            email: req.body.email,
            address: req.body.address,
            notes: req.body.notes,
            type: req.body.type,
        })

        if (req.body.type == "Customer") {
            const createdAccount = await AccountsController.createAccountDBMigration(new Date(), req.body.name + " Account", "", "Customer", req.body.openingBalance, contact.id, "","", false); 
            let updatedContactObject = {
                accountId: createdAccount.id
            }
            await Contacts.update(updatedContactObject, contact.id)
        }
        else {
            let updatedContactObject = {
                accountId: null
            }
            await Contacts.update(updatedContactObject, contact.id)
        }
            
        res.send(contact);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: CONTACTS_STRINGS.ERROR_CREATING_CONTACT, stack: err.stack})
    }
}

const createContactDBMigration = async (type, name, businessName, number, email, address, notes, openingBalance) => {
    const contact = await Contacts.create({
        type: type,
        name: name,
        businessName: businessName,
        number: number,
        email: email,
        address: address,
        notes: notes,
    })

    if (type == "Customer") {
        const createdAccount = await AccountsController.createAccountDBMigration(new Date(), name + " Account", "", "Customer", openingBalance, contact.id, "","", false); 
        let updatedContactObject = {
            accountId: createdAccount.id
        }
        await Contacts.update(updatedContactObject, contact.id)
    }
    else {
        let updatedContactObject = {
            accountId: null
        }
        await Contacts.update(updatedContactObject, contact.id)
    }
}

/**update a contact by id*/
const updateContact = async (req, res) => {
    try {
        if (!IsContactBodyValid(req.body, res))
            return;
        if (!req.body.type) {
            res.status(406).send({error: CONTACTS_STRINGS.CONTACT_TYPE_NULL})
            return;
        }

        if (req.body.type == "Customer") {
            updateAccountObject = {
                name: req.body.name + " Account"
            }
            await AccountsModel.update(updateAccountObject, req.body.accountId)

            //also update opening balance
            await accounttransactionsController.updateOpeningBalance(req.body.accountId, req.body.openingBalance);
        }

        await Contacts.update(req.body,req.params.id) ? 
        res.send({message: CONTACTS_STRINGS.CONTACT_UPDATED_SUCCESSFULLY}) : 
        res.send({error: `${CONTACTS_STRINGS.ERROR_UPDATING_CONTACT}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: CONTACTS_STRINGS.ERROR_UPDATING_CONTACT, stack: err.stack})
    }
}

/** get a contact with id */
const getContact = async (req, res) => {
    try {
        var contact = await Contacts.getByID(req.params.id)
        if (contact) {
            if (contact.type == "Customer") {
                const opening = (await accounttransactionsModel.getFirstTransaction(contact.accountId)).amount
                contact.setDataValue("openingBalance", opening);
            }
            
            res.send(contact)
        }
        else {
            res.send({error: CONTACTS_STRINGS.CONTACT_NOT_FOUND, message: `${CONTACTS_STRINGS.CONTACT_NOT_FOUND} ,id=${req.params.id}`})
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: CONTACTS_STRINGS.ERROR_GETTING_CONTACT, stack: err.stack})
    }
}

/** get all contacts */
const getAllContacts = async (req, res) => {
    try {
        res.send(await Contacts.getAll())
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: CONTACTS_STRINGS.ERROR_GETTING_CONTACTS, stack: err.stack})
    }
}

/** get all suppliers*/
const getAllSuppliers = async (req, res) => {
    try {
        res.send(await Contacts.getAllByType(CONTACTS_STRINGS.SUPPLIER))
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: CONTACTS_STRINGS.ERROR_GETTING_CONTACTS, stack: err.stack})
    }
}

/** get all customers*/
const getAllCustomers = async (req, res) => {
    try {
        res.send(await Contacts.getAllByType(CONTACTS_STRINGS.CUSTOMER))
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: CONTACTS_STRINGS.ERROR_GETTING_CONTACTS, stack: err.stack})
    }
}

/** delete contact by id */
const deleteContact = async (req, res) => {
    try {
        const id = req.params.id;
        await Contacts.deleteById(req.params.id) ? res.send({message: CONTACTS_STRINGS.CONTACT_DELETED}) : res.send({error: `${CONTACTS_STRINGS.CONTACT_NOT_DELETED}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: CONTACTS_STRINGS.CONTACT_NOT_DELETED, stack: err.stack})
    }
}

const IsContactBodyValid = (body, res) => {
    if (!body.name) {
        res.status(406).send({message: CONTACTS_STRINGS.CONTACT_NAME_NULL});
        return false
    }
    if (!body.type) {
        res.status(406).send({message: CONTACTS_STRINGS.CONTACT_TYPE_NULL})
        return false
    }
    if (body.type != CONTACTS_STRINGS.SUPPLIER && body.type != CONTACTS_STRINGS.CUSTOMER) {
        res.status(406).send({message: CONTACTS_STRINGS.INVALID_CONTACT_TYPE})
        return false
    }
    return true
}

/** get all customers by name filter */
const getAllCustomersByNameFilter = async (req, res) => {
    try {
        const customers = await Contacts.getAllCustomersByNameFilter(req.params.filter)
        res.send(customers)
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: 'Error Getting Customers', stack: err.stack})
    }
}

module.exports = {
    createContact,
    updateContact,
    getContact,
    getAllContacts,
    getAllSuppliers,
    getAllCustomers,
    deleteContact,
    createContactDBMigration,
    getAllCustomersByNameFilter
}
const CONTACTS_STRINGS = require('../constants/contacts.strings')
const Contacts = require('../models/contacts.model')

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
        res.send(contact);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: CONTACTS_STRINGS.ERROR_CREATING_CONTACT, stack: err.stack})
    }
}

/**update a contact by id*/
const updateContact = async (req, res) => {
    try {
        if (!IsContactBodyValid(req.body, res))
            return;
        if (!req.body.type) {
            res.status(400).send({error: CONTACTS_STRINGS.CONTACT_TYPE_NULL})
            return;
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
        const contact = await Contacts.getByID(req.params.id)
        contact? res.send(contact) : res.send({error: CONTACTS_STRINGS.CONTACT_NOT_FOUND, message: `${CONTACTS_STRINGS.CONTACT_NOT_FOUND} ,id=${req.params.id}`})
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
        res.status(400).send({message: CONTACTS_STRINGS.CONTACT_NAME_NULL});
        return false
    }
    if (!body.type) {
        res.status(400).send({message: CONTACTS_STRINGS.CONTACT_TYPE_NULL})
        return false
    }
    if (body.type != CONTACTS_STRINGS.SUPPLIER && body.type != CONTACTS_STRINGS.CUSTOMER) {
        res.status(400).send({message: CONTACTS_STRINGS.INVALID_CONTACT_TYPE})
        return false
    }
    return true
}

module.exports = {
    createContact,
    updateContact,
    getContact,
    getAllContacts,
    getAllSuppliers,
    getAllCustomers,
    deleteContact,
}
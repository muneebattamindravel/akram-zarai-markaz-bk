const backup = async (req, res) => {
    try {
        const fs = require('fs')
        const spawn = require('child_process').spawn
        const dumpFileName = `${Math.round(Date.now() / 1000)}.dump.sql`
        const writeStream = fs.createWriteStream(dumpFileName)
        const dump = spawn('mysqldump', [
            '-u',
            'azmuser1',
            '-pazmuser1',
            'akram-zarai-markaz',
        ])

        dump
        .stdout
        .pipe(writeStream)
        .on('finish', function () {
            console.log('Completed')
            res.status(200).send();
        })
        .on('error', function (err) {
            console.log(err)
            res.status(500).send();
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: 'Erorr Taking Backup', stack: err.stack})
    }
}

module.exports = {
    backup,
}
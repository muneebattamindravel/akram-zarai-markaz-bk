const restore = async (req, res) => {
    const { exec } = require('child_process');
    const fileName = req.body.fileName;

    let importTo = {
        host: "localhost",
        user: "root",
        password: "7SlQOqaDnfEp",
        database: "akram-zarai-markaz"
    }

    exec(`mysql -h ${importTo.host} -u${importTo.user} -p${importTo.password} ${importTo.database} < ${fileName}`, 
    (err, stdout, stderr) => {
        if (err) { 
            res.status(500).send(`${err}`);
            return; 
        }
        res.status(200).send(`Restore Done`);
    });
}

module.exports = {
    restore,
}


       
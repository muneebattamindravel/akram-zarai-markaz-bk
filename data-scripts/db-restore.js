const restore = async (req, res) => {
    const { exec } = require('child_process');
    const fileName = req.body.fileName;

    let importTo = {
        host: "http://13.213.139.143",
        user: "root",
        password: "7SlQOqaDnfEp",
        database: "akram-zarai-markaz-restore"
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


       
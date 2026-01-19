const { spawn } = require("child_process");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// Determine the correct mysqldump and mysql paths based on the platform
const isWindows = process.platform === "win32" || process.platform === "win64";
const isMac = process.platform === "darwin";
const isLinux = process.platform === "linux";

const mysqldumpPath = isWindows
  ? "C:\\MAMP\\bin\\mysql\\bin\\mysqldump"
  : isMac
  ? "/Applications/MAMP/Library/bin/mysql80/bin/mysqldump"
  : "/opt/bitnami/mariadb/bin/mysqldump";

const mysqlPath = isWindows
  ? "C:\\MAMP\\bin\\mysql\\bin\\mysql"
  : isMac
  ? "/Applications/MAMP/Library/bin/mysql80/bin/mysql"
  : "/opt/bitnami/mariadb/bin/mysql"; // ✅ FIXED

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function makeDumpMariaDbCompatible(dumpFilePath) {
  let sql = fs.readFileSync(dumpFilePath, "utf8");
  sql = sql.replaceAll("utf8mb4_0900_ai_ci", "utf8mb4_general_ci");
  sql = sql.replaceAll("utf8mb4_0900_as_ci", "utf8mb4_general_ci");
  fs.writeFileSync(dumpFilePath, sql, "utf8");
}

function runDumpToFile(dumpFilePath) {
  return new Promise((resolve, reject) => {
    const args = [
      "--protocol=tcp",
      `-h${process.env.DB_HOST}`,
      `--port=${process.env.DB_PORT}`,
      `-u${process.env.DB_USER}`,
      `--password=${process.env.DB_PASSWORD}`,
      process.env.DB_NAME,
    ];

    const child = spawn(mysqldumpPath, args, { stdio: ["ignore", "pipe", "pipe"] });

    const out = fs.createWriteStream(dumpFilePath);
    child.stdout.pipe(out);

    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d.toString()));

    child.on("error", (e) => reject(new Error(`mysqldump spawn error: ${e.message}`)));

    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(`mysqldump failed (code ${code}): ${stderr}`));
      resolve();
    });
  });
}

function runRestoreFromFile(dumpFilePath) {
  return new Promise((resolve, reject) => {
    const args = [
      `-h${process.env.DB_HOST}`,
      `--port=${process.env.DB_PORT}`,
      `-u${process.env.DB_USER}`,
      `--password=${process.env.DB_PASSWORD}`,
      process.env.DB_NAME,
    ];

    const child = spawn(mysqlPath, args, { stdio: ["pipe", "pipe", "pipe"] });

    fs.createReadStream(dumpFilePath).pipe(child.stdin);

    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d.toString()));

    child.on("error", (e) => reject(new Error(`mysql spawn error: ${e.message}`)));

    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(`mysql restore failed (code ${code}): ${stderr}`));
      resolve();
    });
  });
}

function uploadFileToServer(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("dumpFile", fs.createReadStream(filePath), { filename: fileName });

    form.submit(process.env.UPLOAD_URL_SERVER, (error, response) => {
      if (error) return reject(new Error(`Upload request error: ${error.message}`));

      let body = "";
      response.on("data", (chunk) => (body += chunk.toString()));
      response.on("end", () => {
        if (response.statusCode !== 200) {
          return reject(new Error(`Upload failed (${response.statusCode}): ${body}`));
        }
        resolve(body);
      });
    });
  });
}

// ===================== BACKUP + UPLOAD =====================
const backup = async (req, res) => {
  const responseObject = {
    fileCreated: false,
    fileUploaded: false,
    fileName: "",
    message: "",
    error: "",
  };

  try {
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");
    const dumpFileName = `${date}-${time}-${process.env.DB_NAME}.dump.sql`;

    const localDataBackups = path.join(__dirname, "../local-data-backups");
    ensureDir(localDataBackups);

    const dumpFilePath = path.join(localDataBackups, dumpFileName);

    console.log("mysqldump path:", mysqldumpPath);
    console.log("mysql path:", mysqlPath);
    console.log("Dump file path:", dumpFilePath);

    await runDumpToFile(dumpFilePath);
    responseObject.fileCreated = true;
    responseObject.fileName = dumpFileName;
    responseObject.message = "Database dump created successfully.";

    await uploadFileToServer(dumpFilePath, dumpFileName);
    responseObject.fileUploaded = true;
    responseObject.message = "Database dump created and uploaded successfully.";

    return res.status(200).send(responseObject);
  } catch (err) {
    console.error("Backup/upload error:", err.message);
    responseObject.error = err.message || String(err);
    responseObject.message = "Backup/upload failed.";
    return res.status(500).send(responseObject);
  }
};

// ===================== UPLOAD + RESTORE =====================
const upload = async (req, res) => {
  try {
    if (!req.files || !req.files.dumpFile) {
      return res.status(400).send({ message: "No file received" });
    }

    const dumpFile = req.files.dumpFile;

    const uploadedDataBackups = path.join(__dirname, "../uploaded-data-backups");
    ensureDir(uploadedDataBackups);

    const dumpFilePath = path.join(uploadedDataBackups, dumpFile.name);

    console.log("Saving uploaded file:", dumpFilePath);
    await dumpFile.mv(dumpFilePath);

    // ✅ Fix collation incompatibility (MySQL8 dump -> MariaDB/MySQL<8 restore)
    makeDumpMariaDbCompatible(dumpFilePath);

    console.log("Restoring database from:", dumpFilePath);
    await runRestoreFromFile(dumpFilePath);

    return res.status(200).send({ message: "Database restored successfully." });
  } catch (err) {
    console.error("Restore error:", err.message);
    return res.status(500).send({
      message: "Error restoring database",
      error: err.message || String(err),
    });
  }
};

module.exports = { backup, upload };

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const db = require("./models");
const { EnvironmentalData } = db;

const dataDir = path.join(__dirname, "data");

async function importCSV() {
  try {
    await db.sequelize.sync();

    const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".csv"));
    console.log(`Found ${files.length} CSV files`);

    for (const file of files) {
      const barangayName = path.basename(file, ".csv");
      const filePath = path.join(dataDir, file);
      const records = [];

      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => {
            const timestamp = new Date(`${row.Date}T${row.Time}:00`);

            records.push({
              barangay: barangayName,
              timestamp,
              rainfall_mm: parseFloat(row["Rainfall_mm"]),
              water_level_m: parseFloat(row["Water_Level_m"]),
              flow_velocity_ms: parseFloat(row["Flow_Velocity_ms"]),
              wind_speed_mps: parseFloat(row["Wind_Speed_mps"]),
              wind_direction: row["Wind_Direction"],
              temperature_c: parseFloat(row["Temperature_C"]),
              humidity_percent: parseFloat(row["Humidity_%"]),
            });
          })
          .on("end", async () => {
            try {
              await EnvironmentalData.bulkCreate(records);
              console.log(
                `Imported ${records.length} rows from ${file} as ${barangayName}`
              );
              resolve();
            } catch (err) {
              reject(err);
            }
          })
          .on("error", reject);
      });
    }

    console.log("All CSVs imported successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Import error:", err);
    process.exit(1);
  }
}

importCSV();

import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

const pool = mysql.createPool({
  host: "dicerps2007-dicerps.j.aivencloud.com",
  port: 13054,
  user: "avnadmin",
  password: "AVNS_0rAFjy38FBQikYMIxEL",
  database: "defaultdb",
  ssl: {
    rejectUnauthorized:false,
  },
});

export default pool;

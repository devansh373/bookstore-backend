import { v2 as cloudinary } from "cloudinary";
import http from "http";
import connectDB from "./utils/db";
// import { initSocketServer } from "./socketServer";
import { app } from "./app";

require("dotenv").config();

// const cluster = require("cluster");
// const numCPUs = require("os").cpus().length;
// console.log("numCPUs", numCPUs);
// if (false && cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);

//   // Fork workers.
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker: any, code: any, signal: any) => {
//     console.log(`worker ${worker.process.pid} died`);
//   });
// } else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  const server = http.createServer(app);

  // cloudinary config
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
  });

  // initSocketServer(server);

  // create server
  server.listen(process.env.PORT, () => {
    console.log(`Server is connected with port ${process.env.PORT}`);
    connectDB();
  });
// }

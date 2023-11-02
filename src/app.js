const express = require("express");
const cors = require("cors");
const adminRouter = require("./db/admin");
const userRouter = require("./db/user");
require("./collection/collection");

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use(adminRouter);
app.use(userRouter);

app.listen(8000, () => {
  console.log("listning to port 8000 ..");
});

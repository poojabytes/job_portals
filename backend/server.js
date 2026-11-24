const app = require("./app");
require("./config/database"); // Database Connection
const { colorizeText } = require("./utils/others");

const server = require("http").createServer(app);

const PORT = process.env.PORT || 4002;

server.listen(PORT, () => {
  console.log(colorizeText("Server Running on Port " + PORT, "green"));
});



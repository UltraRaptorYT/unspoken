const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const supabase = require("./config/supabase");
const PORT = 8081;
require("dotenv").config();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  return res.render("index");
});

io.on("connection", (socket) => {
  console.log("New user connected");
  socket.emit("clientid", socket.id);
  socket.on("join-room", (roomId, userID) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userID);
    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userID);
    });
  });
  socket.on("message", async (payload) => {
    const { roomId, message, userID, phoneNo } = payload;
    let output = await uploadMessage(roomId, phoneNo, message);
    if ("id" in output) {
      io.to(roomId).emit("message", {
        user: userID,
        message: message,
        id: output["id"],
      });
    }
  });
});

server.listen(process.env.PORT || PORT);
console.log(
  `Web server is listening at http://localhost:${process.env.PORT || PORT}/`
);

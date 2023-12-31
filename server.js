const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const supabase = require("./config/supabase");
const PORT = 8081;
const uuid = require("uuid");
const HOSTNAME_URL = process.env.HOSTNAME_URL;

require("dotenv").config();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  return res.render("index", { HOSTNAME_URL });
});

app.post("/createRoom/:roomID", async (req, res) => {
  let roomID = req.params.roomID;
  const { data, error } = await supabase
    .from("unspoken_room")
    .insert([{ roomID }])
    .select();
  return res.status(201).json({ message: "Room Created!" });
});

app.get("/createRoom/:roomId", (req, res) => {
  return res.redirect("/createRoom/" + roomId);
  return res.render("createRoom");
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

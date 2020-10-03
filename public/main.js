// Pages
const joinPage = document.getElementById("join-page");
const chatPage = document.getElementById("chat-page");

// HTML Elements
const joinForm = document.getElementsByClassName("join-form")[0];
const userNameInput = document.getElementById("user-name-input");
const roomsSelect = document.getElementById("rooms");
const joinButton = document.getElementById("joinchat");
const roomName = document.getElementById("room-name");
const chatMessage = document.getElementById("chat-messages");
const usersInRoom = document.getElementById("users");
const sendMessageButton = document.getElementById("send-message");
const messageInput = document.getElementById("msg");
const leaveRoomButton = document.getElementById("leave-room-button");

// Connect to server
const socket = io();

//Join Page event handlers...

//In join page: if user presses enter, treat it like a click on joinButton.
//Prevent browser from actually submitting the form, by returning false.
joinForm.onsubmit = () => {
  joinButton.click();
  return false;
};

userNameInput.addEventListener("focus", () => {
  userNameInput.classList.add("focus");
  roomsSelect.classList.add("focus");
});

userNameInput.addEventListener("blur", () => {
  if (userNameInput.value === "") {
    userNameInput.classList.remove("focus");
    roomsSelect.classList.remove("focus");
  }
});

joinButton.addEventListener("click", (e) => {
  e.preventDefault(); //Prevent browser default behavior
  const username = userNameInput.value;
  const room = roomsSelect.value;
  joinPage.style.display = "none";
  chatPage.style.display = "block";
  socket.emit("user join", { username, room });
  roomName.innerText = room;
});

//Chat page event handlers
sendMessageButton.addEventListener("click", (e) => {
  e.preventDefault();
  const msgText = messageInput.value;
  if (msgText === "") return;
  socket.emit("chat message", msgText);
  messageInput.value = "";
});

leaveRoomButton.addEventListener("click", () => {
  location.reload();
});

//Message recieved from server
socket.on("message", (msg) => {
  showMessageInChat(msg, false);
  chatMessage.scrollTop = chatMessage.scrollHeight; //scroll to new message
});

//Message sent by ourselves
socket.on("own message", (msg) => {
  showMessageInChat(msg, true);
  chatMessage.scrollTop = chatMessage.scrollHeight; //scroll to new message
});

//Server sends who's online
socket.on("show users", (users) => showUsersInRoom(users));

function showMessageInChat(msg, ownMsg) {
  const msgDiv = document.createElement("div");
  const metadata = document.createElement("p");
  const msgText = document.createElement("p");
  msgDiv.classList.add("message");
  metadata.classList.add("meta");
  metadata.innerHTML = "";
  if (ownMsg) {
    msgDiv.style.backgroundColor = "#0097e6";
  } else {
    metadata.innerHTML = `${msg.username}`;
  }
  metadata.innerHTML += `   <span>${msg.time}</span>`;
  msgText.innerHTML = msg.text.trim();
  msgDiv.append(metadata);
  msgDiv.append(msgText);
  chatMessage.append(msgDiv);
}

function showUsersInRoom(users) {
  usersInRoom.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerHTML = `<i class="fas fa-user-circle"></i>  ${user.username}`;
    usersInRoom.append(li);
  });
}

const { Server } = require("socket.io");
const {
  getOrCreateChat,
  saveMessage,
  fetchMessages,
  fetchUsersChatsWithId,
  insertUsersSocketId,
  fetchMessagesById,
  fetchChatsWithId,

} = require("../models/usersModel");
const { sendPushNotification } = require('../utils/helper')

module.exports = function (server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userSockets = {};
    socket.on('user_connected', async (userId) => {
      userSockets[userId] = socket.id
      await insertUsersSocketId(socket.id, userId)
    })

    socket.on("join_chat", async ({ isSend, user1Id, user2Id }) => {
      await getOrCreateChat(user1Id, user2Id, (err, chat) => {
        if (err) {
          console.error("Error joining chat:", err);
          return;
        }
        if (!chat || !chat.id) {
          console.error("Chat object is invalid or missing chat.id");
          return;
        }
        socket.join(`${chat.id}`);
        socket.chatId = chat.id;
        socket.emit("chat_joined", chat.id);
      });
      if (isSend == 1) {
        const message = 'Is this product available';
        const sendNewMessages = await saveMessage(chatId, user1Id, message);
        let token1 = await fetchUsersChatsWithId(user2Id);
        token1 = token1[0].fcmToken
        sendPushNotification(token1, message);
      } else {
        return true
      }
    });

    socket.on("send_message", async ({ chatId, senderId, message }) => {
      try {
        const sendNewMessages = await saveMessage(chatId, senderId, message);
        const messageFetchByid = await fetchMessagesById(sendNewMessages.insertId);
        const chatUsers = await fetchChatsWithId(chatId);
        if (!chatUsers || chatUsers.length === 0) {
          console.error("No users found for the chat");
          return;
        }
        const fetchUserSocketID = userSockets[chatUsers[0].user1_id];
        const fetchUser2SocketID = userSockets[chatUsers[0].user2_id];
        const receiverSocketId = senderId === fetchUserSocketID ? fetchUser2SocketID : fetchUserSocketID;
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("getMessage", messageFetchByid[0]);
        } else {
          let token1 = await fetchUsersChatsWithId(chatUsers[0].user1_id);
          token1 = token1[0].fcmToken
          await sendPushNotification(token1, messageFetchByid[0]);
        }

        // if (fetchUserSocketID) {
        //   io.to(fetchUserSocketID).emit("getMessage", messageFetchByid[0]);
        // } else {
        //   let token1 = await fetchUsersChatsWithId(chatUsers[0].user1_id);
        //   token1 = token1[0].fcmToken
        //   sendPushNotification(token1, messageFetchByid[0]);
        // }
        // if (fetchUser2SocketID) {
        //   io.to(fetchUser2SocketID).emit("getMessage", messageFetchByid[0]);
        // } else {
        //   let token2 = await fetchUsersChatsWithId(chatUsers[0].user2_id);
        //   token2 = token2[0].fcmToken
        //   sendPushNotification(token2, messageFetchByid[0]);
        // }
      } catch (error) {
        console.error("Error handling send_message:", error);
      }
    });

    socket.on("fetch_messages", async ({ chatId }) => {
      let allMsg = await fetchMessages(chatId)
      socket.emit("chat_history", allMsg);
    });

    socket.on("disconnect", () => {
      if (socket.chatId) {
        console.log(`User disconnected from chat_${socket.chatId}`);
        socket.leave(`chat_${socket.chatId}`);
      }
    });
  })
}
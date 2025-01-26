import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const MODERATION_SERVICE_PORT = 4003;

// Launching the server
const app = express();
app.use(bodyParser.json());

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  if (type === "CommentCreated") {
    const status = data.content.includes("orange") ? "rejected" : "approved";
    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentModerated",
      data: {
        id: data.id,
        postId: data.postId,
        status,
        content: data.content,
      },
    });
  }

  res.send({});
});

app.listen(MODERATION_SERVICE_PORT, () => {
  console.log(`Moderation service listening on ${MODERATION_SERVICE_PORT}`);
});

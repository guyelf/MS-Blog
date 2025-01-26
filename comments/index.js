import express from "express";
import { randomBytes } from "crypto";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";

const COMMENTS_PORT_NUM = 4001;
// Storing in-memory the posts
const commentsByPostId = {};
const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  // Get the new post data
  const postId = req.params.id;

  const { content } = req.body;

  const comments = commentsByPostId[postId] || [];

  const commentId = randomBytes(4).toString("hex");

  comments.push({ id: commentId, content, status: "pending" });

  commentsByPostId[postId] = comments;
  // Push the data to the Event-Bus
  await axios.post("http://event-bus-srv:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId,
      status: "pending",
    },
  });

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  console.log("Received event on Comment service", req.body.type);
  const { type, data } = req.body;
  if (type === "CommentModerated") {
    const { postId, id, status, content } = data;
    const comments = commentsByPostId[postId];
    const comment = comments.find((comment) => {
      return comment.id === id;
    });
    comment.status = status;
    // Push the data to the Event-Bus
    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentUpdated",
      data: {
        id,
        status,
        postId,
        content,
      },
    });
  }
  res.send({});
});

app.listen(COMMENTS_PORT_NUM, () => {
  console.log("v-1.0.0");
  console.log(`Comments listening on ${COMMENTS_PORT_NUM}`);
});

import express from "express";
import { randomBytes } from "crypto";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";

const POSTS_PORT_NUM = 4000;
// Storing in-memory the posts
const posts = {};

// Launching the server
const app = express();
app.use(bodyParser.json());
app.use(cors());

// This is more for testing purposes as the actual posts will be served by react app
app.get("/posts", (req, res) => {
  res.send(posts);
});
app.post("/posts/create", async (req, res) => {
  // Get the new post data
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;
  // Put it in the posts object
  posts[id] = { id, title };

  // Emitting events to the EventBus
  await axios.post("http://event-bus-srv:4005/events", {
    type: "PostCreated",
    data: {
      id,
      title,
    },
  });

  res.status(201).send(posts[id]);
});

app.post("/events", (req, res) => {
  console.log("Received event on Posts Service", req.body.type);
  res.send({});
});

app.listen(POSTS_PORT_NUM, () => {
  console.log("v-1.0.0");
  console.log(`Listening for posts on ${POSTS_PORT_NUM}`);
});

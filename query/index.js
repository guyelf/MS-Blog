import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";

const QUERY_SERVICE_PORT = 4002;

// In memory posts object that will contain all the posts (and comments) created by the app
const posts = {};

const app = express();
app.use(cors());
app.use(bodyParser.json());

const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    const { title, id } = data;
    posts[id] = {
      id,
      title,
      comments: [],
    };
  }
  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;
    posts[postId].comments.push({ content, id, status });
  }

  if (type === "CommentUpdated") {
    const { id, content, postId, status } = data;
    const comment = posts[postId].comments.find((comment) => comment.id === id);
    comment.status = status;
    comment.content = content;
  }
};

app
  .get("/posts", (req, res) => {
    res.send(posts);
  })
  .post("/events", (req, res) => {
    const { type, data } = req.body;
    handleEvent(type, data);
    res.send({});
  });

app.listen(QUERY_SERVICE_PORT, async () => {
  console.log(`Query-Service listening on port ${QUERY_SERVICE_PORT}`);
  const res = await axios.get("http://event-bus-srv:4005/events");
  for (let event of res.data) {
    console.log("In Query-srv processing event:\n ", event.type);
    handleEvent(event.type, event.data);
  }
});

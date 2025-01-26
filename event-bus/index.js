import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const EVENT_BUS_PORT = 4005;
const app = express();
app.use(bodyParser.json());

const postsEndpoint = "http://posts-clusterip-srv:4000";
const commentsEndpoint = "http://comments-srv:4001";
const queriesEndpoint = "http://query-srv:4002";
const moderationEndpoint = "http://moderation-srv:4003";

const events = [];

app.post("/events", (req, res) => {
  const event = req.body;

  events.push(event);

  axios.post(`${postsEndpoint}/events`, event).catch((err) => {
    console.log(err);
  });
  axios.post(`${commentsEndpoint}/events`, event).catch((err) => {
    console.log(err);
  });
  axios.post(`${queriesEndpoint}/events`, event).catch((err) => {
    console.log(err);
  });
  axios.post(`${moderationEndpoint}/events`, event).catch((err) => {
    console.log(err);
  });

  res.send({ status: "OK" });
});

app.get("/events", (req, res) => {
  console.log(req); // Todo: Remove
  res.send(events);
});

app.listen(EVENT_BUS_PORT, () => {
  console.log("v-1.0.0");
  console.log(`EventBus listening on port ${EVENT_BUS_PORT}`);
});

import { TwitterOpenApi } from 'twitter-openapi-typescript';
import {Hono} from "hono"
import type { Env } from "./types"
import webfinger from "./webfinger"

const app = new Hono<Env>()
const api = new TwitterOpenApi();
const client = await api.getGuestClient();

app.get("/", (c) => {
  return c.text("Hello World")
})

app.route("/.well-known/webfinger",webfinger)

app.get('/.well-known/nodeinfo', (c) => {
  const strHost = new URL(c.req.url).hostname
  return c.json({
    "links": [
      {
        "rel": "http://nodeinfo.diaspora.software/ns/schema/2.1",
        "href": `https://${strHost}/nodeinfo/2.1` // example.comは各自のドメインにすること
      }
    ]
  })
})

app.get("/nodeinfo/2.1", (c) => {
  return c.json({
    "openRegistrations": false,
    "protocols": [
      "activitypub"
    ],
    "software": {
      "name": "twitter-bridge",
      "version": "0.1.0"
    },
    "usage": {
      "users": {
        "total": 0
      }
    },
    "services": {
      "inbound": [],
      "outbound": []
    },
    "metadata": {
    },
    "version": "2.1"
  })
})

export default app
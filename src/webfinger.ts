import { Hono } from "hono";
import { TwitterOpenApi } from 'twitter-openapi-typescript';

const app = new Hono();
const api = new TwitterOpenApi();
const client = await api.getGuestClient();

app.get("/", async (c) => {
    const strHost = new URL(c.req.url).hostname
    const checkregex = /acct:([^@]+)@([^/]+)/.exec(c.req.query('resource')!)
    if (!checkregex || checkregex[2] !== strHost) return c.notFound()
    const strName = checkregex[1]
    const user = await client.getUserApi().getUserByScreenName({screenName: strName})
    if (!user.data.user) return c.notFound()
    const userLegacy = user.data?.user?.legacy;
    const attachment = []
    if (userLegacy?.location) {
        attachment.push({
            "type": "PropertyValue",
            "name": "Location",
            "value": userLegacy.location
        })
    }
    if (userLegacy?.url) {
        attachment.push({
            "type": "PropertyValue",
            "name": "URL",
            "value": `<p><a href="${new URL(userLegacy.url!).toString()}">${userLegacy.url!}</a></p>`
        })
    }
    const r = {
        "@context": [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1",
            {
                "manuallyApprovesFollowers": "as:manuallyApprovesFollowers",
                "toot": "http://joinmastodon.org/ns#",
                "featured": {
                    "@id": "toot:featured",
                    "@type": "@id"
                },
                "schema": "http://schema.org#",
                "PropertyValue": "schema:PropertyValue",
                "value": "schema:value",
                "discoverable": "toot:discoverable",
                "indexable": "toot:indexable"
            }
        ],
        "id": `https://x-activitypub-bridge.deno.dev/users/${user.data.user.restId}`,
        "type": "Person",
        "following": `https://x-activitypub-bridge.deno.dev/users/${user.data.user.restId}/following`,
        "followers": `https://x-activitypub-bridge.deno.dev/users/${user.data.user.restId}/followers`,
        "liked": `https://x-activitypub-bridge.deno.dev/users/${user.data.user.restId}/liked`,
        "inbox": `https://x-activitypub-bridge.deno.dev/users/${user.data.user.restId}/inbox`,
        "outbox": `https://x-activitypub-bridge.deno.dev/users/${user.data.user.restId}/outbox`,
        "preferredUsername": strName,
        "name": userLegacy.screenName,
        "summary": userLegacy.description,
        "url": `https://x.com/intent/user?screen_name=${strName}`,
        "manuallyApprovesFollowers": false,
        "discoverable": true,
        "indexable": true,
        "published": new Date(userLegacy.createdAt).toISOString(),
        "attachment": [
            ...attachment,
            {
                "type": "PropertyValue",
                "name": "X ActivityPub Bridge",
                "value": "<a href=\"https://github.com/Lqm1/XActivityPubBridge\">github.com/Lqm1/XActivityPubBridge</a>"
            },
            {
                "type": "PropertyValue",
                "name": "Original",
                "value": `<p><a href="https://x.com/${strName}">https://x.com/${strName}</a></p>`
            }
        ],
        "icon": {
            "type": "Image",
            "url": userLegacy?.profileImageUrlHttps,
        },
        "image": {
            "type": "Image",
            "url": userLegacy?.profileBannerUrl,
        },
        "location": {
            "type": "Place",
            "name": userLegacy?.location,
        }
    }
    return c.json(r, 200, { 'Content-Type': 'jrd+json' })
})

export default app;
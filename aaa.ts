import { TwitterOpenApi } from 'twitter-openapi-typescript';

const api = new TwitterOpenApi();
const client = await api.getGuestClient();

console.log((await client.getUserApi().getUserByScreenName({screenName: "X"})).data.user)
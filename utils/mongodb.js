/*
	Used https://github.com/vercel/next.js/blob/canary/examples/with-mongodb/lib/mongodb.ts
	as reference
*/

import { MongoClient, ServerApiVersion, ObjectId  } from 'mongodb'

// Check if the mongodb uri exists in the local env
if (!process.env.MONGODB_URI) {
	throw new Error("Missing MONGODB_URI environment variable");
}

const mongoURI = process.env.MONGODB_URI;
const options = { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 };

let client = new MongoClient(mongoURI, options);

export { ObjectId }
export default client;
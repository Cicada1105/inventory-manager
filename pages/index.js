import Link from 'next/link'

import mongoClient, { ObjectId } from '../utils/mongodb.js'

import AuthenticateUser from '../utils/auth.js'

import { CustomTable } from '../components'
import { formatTitle } from '../utils/formatting.js'

export default function Home({ collections, user }) {
  const restrictions = user.restrictions;
  const parsedCollections = JSON.parse(collections);

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">
        Welcome { user["first_name"] } to the Inventory Manager
      </h1>
      <p className="text-center">Your Access Level: <span className="underline">{ user["access_type"] }</span></p>
      <p className="text-center">What you have access to:</p>
      {
        Object.entries(parsedCollections).map((entry, i) => 
          <CustomTable key={i} title={(<Link href={`/${entry[0]}/list`}>{formatTitle(entry[0])}</Link>)} tableContent={entry[1]} />
        )
      }
    </>
  )
}


export const getServerSideProps = AuthenticateUser(async function(context) {
  let { req } = context;
  // Store user data
  let user = req.session['user'];

  let client;
  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);

    /* Query database for collections the current user has access to */
    // Obtain names of collections the current user has access to
    let userAccessibleCollections = Object.keys(user["restrictions"]).filter(page => user["restrictions"][page].length !== 0);
    // Retrieve all collections
    let collections = await db.collections();
    // Filter out only the collections that the current user has access to (As filtered previously)
    let userCollections = collections.filter(collection => userAccessibleCollections.includes(collection["collectionName"]));

    // List out first three of each collection
    let userCollectionsLimited = {};
    for (let collection of userCollections) {
      let result = await collection.find({}).limit(3).toArray();

      let filteredResults = result.map((document) => {
        let tempDoc = {};
        Object.keys(document).forEach((key) => {
          if (key.includes("_id") || key.includes("password") || key.includes('restrictions'))
            return;
          else
            tempDoc[key] = document[key];
        });
        return tempDoc;
      });

      let nameOfCurrColl = collection["collectionName"];
      userCollectionsLimited[nameOfCurrColl] = filteredResults;
    }

    let result = await db.collection("work_orders").find({
      user_id: new ObjectId(user["_id"])
    }).limit(3).toArray();
    let filteredResults = result.map((document) => {
      let tempDoc = {};
      Object.keys(document).forEach((key) => {
        if (key.includes("id") || key.includes("password") || key.includes('restrictions'))
          return;
        else
          tempDoc[key] = document[key];
      });
      return tempDoc;
    });

    userCollectionsLimited["my_work_orders"] = filteredResults;

    return {
      props: { 
        collections: JSON.stringify(userCollectionsLimited),
        user
      }
    }
  } catch(e) {
    console.error(e);

    return {
      props: { user: {} }
    }
  }
});
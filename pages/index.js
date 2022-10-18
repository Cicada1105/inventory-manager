import mongoClient, { ObjectId } from '../utils/mongodb.js'

import AuthenticateUser from '../utils/auth.js'

import { PagePreview } from '../components'

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
          <PagePreview key={i} name={entry[0]} page={entry[1]} />
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
      let nameOfCurrColl = collection["collectionName"];
      userCollectionsLimited[nameOfCurrColl] = result;
      // Check if collection name equals work_orders then retrieve work orders for current user
      if (nameOfCurrColl === "work_orders") {
        let result = await collection.find({
          user_id: new ObjectId(user["_id"])
        }).limit(3).toArray();
        userCollectionsLimited["my_work_orders"] = result;
      }
    }

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
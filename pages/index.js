import mongoClient from '../utils/mongodb.js'

import AuthenticateUser from '../utils/auth.js'

export default function Home({ user }) {
  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">
        Welcome { user["first_name"] } to the Inventory Manager
      </h1>
      <p className="text-center">Your Access Level: { user["access_type"] }</p>
    </>
  )
}


export const getServerSideProps = AuthenticateUser(async function(req) {
  // Store user data
  let user = req.session['user'];

  let client;
  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);
    let types = await db.collection("access_types").find({}).toArray();

    return {
      props: { user }
    }
  } catch(e) {
    console.error(e);

    return {
      props: { user: {} }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }
});
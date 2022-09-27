import { withIronSessionSsr } from "iron-session/next";

import mongoClient from '../utils/mongodb.js'
import { ironOptions } from '../utils/config.js'

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

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps(context) {
    // Obtain request parameter from context
    let { req } = context;
    
    // Check if user object is available
    if (req.session?.user) {
      // Store user data
      let user = req.session['user'];

      let client;
      try {
        // Await the connection to the MongoDB URI
        client = await mongoClient.connect();

        let db = client.db(process.env.MONGODB_DB);
        let types = await db.collection("access_types").find({}).toArray();

        return {
          props: {
            //types: JSON.stringify(types),
            user
          }
        }
      } catch(e) {
        console.error(e);

        return {
          props: {
            types: []
          }
        }
      } finally {
        // End connection after closing of app or error
        await client.close();
      }
    }
    else { // User is not logged in
      return {
        redirect: {
          destination: "/login/",
          permanent: true
        }
      }
    }
  },
  ironOptions
);
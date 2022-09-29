import mongoClient from '../utils/mongodb.js'

import AuthenticateUser from '../utils/auth.js'

export default function Home({ user }) {
  const restrictions = user.restrictions;
  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">
        Welcome { user["first_name"] } to the Inventory Manager
      </h1>
      <p className="text-center">Your Access Level: <span className="underline">{ user["access_type"] }</span></p>
      <p className="text-center">What you have access to:</p>
      {
        Object.keys(restrictions).map((page, i) => {
          return (
            (restrictions[page].length !== 0) &&
            <article key={i} className="w-48 m-auto">
              <h5 className="underline">{ page }</h5>
              <ol className="list-decimal list-inside text-center mb-8">
                {
                  restrictions[page].map((access,i) =>
                    <li key={i}>{ access } </li>
                  )
                }
              </ol>
            </article>
          )
        })
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
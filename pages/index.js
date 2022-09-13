import mongoClient from '../utils/mongodb.js'

export default function Home({ types }) {

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">
        Inventory Manager
      </h1>
      <dl style={{color:"white"}}>
      {
        JSON.parse(types).map((type,i) => {
          return (
            <div key={i}>
              <dt>{type.name}</dt>
              <dd>{type.restriction}</dd>
            </div>
          );
        })
      }
      </dl>
    </>
  )
}

export async function getServerSideProps(context) {
  let client;
  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);
    let types = await db.collection("access_types").find({}).toArray();

    return {
      props: {
        types: JSON.stringify(types)
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
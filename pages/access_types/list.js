import Link from 'next/link'
import mongoClient from '../../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'

export default function Users({ types }) {

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">Access Types</h1>
      <Link href="/access_types/new">New Access Type</Link>
      <table style={{color:"white"}}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Restriction Level</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {
          JSON.parse(types).map((type,i) => {
            return (
              <tr key={i}>
                <td>{type.name}</td>
                <td>{type.restriction}</td>
                <td>
                  <FontAwesomeIcon icon={faX} />
                </td>
              </tr>
            );
          })
        }
        </tbody>
      </table>
    </>
  )
}

export const getServerSideProps = AuthenticateUser(async function(context) {
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
    console.log("Error occured");
    return {
      props: {
        types: JSON.stringify([])
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }
});
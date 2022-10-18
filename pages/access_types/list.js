import Link from 'next/link'
import mongoClient from '../../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faX } from '@fortawesome/free-solid-svg-icons'

export default function Users({ types }) {
  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">Access Types</h1>
      <div className="w-fit m-auto my-4">
        <span className="mr-4 hover:underline">
          <Link href="/">Back</Link>
        </span>
        <span className="hover:underline">
          <Link href="/access_types/new">New Access Type</Link>
        </span>
      </div>
      <table className="m-auto">
        <thead>
          <tr>
            <th>Name</th>
            <th className="w-32">Access Types</th>
            <th>Inventory</th>
            <th className="w-32">Legacy Work Orders</th>
            <th className="w-32">Locations</th>
            <th className="w-32">Users</th>
            <th className="w-32">Work Orders</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {
          JSON.parse(types).map((type,i) => {
            return (
              <tr key={i}>
                <td>{type.name}</td>
                {
                  Object.keys(type["restrictions"]).map((page,i) => 
                    type["restrictions"][page].length === 0 ?
                    <td key={i}>No Access</td> :
                    <td key={i}>{type["restrictions"][page].join(", ")}</td>
                  )
                }
                <td>
                  <Link href={`/access_types/update/${type["_id"].toString()}`}>
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </Link>
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
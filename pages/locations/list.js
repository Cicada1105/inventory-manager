import Link from 'next/link'
import { useRouter } from 'next/router'
import mongoClient from '../../utils/mongodb.js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'

export default function Users({ locations }) {
  const routes = useRouter();

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">Locations</h1>
      <Link href="/locations/new">New Location</Link>
      <table className="m-auto mt-8 text-center" style={{color:"white"}}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {
          JSON.parse(locations).map((location,i) => {
            return (
              <tr key={i}>
                <td>{location.name}</td>
                <td>{location.description}</td>
                <td>
                  <FontAwesomeIcon onClick={() => routes.push(`/locations/update?id=${location._id}`)} icon={faPenToSquare} />
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

export async function getServerSideProps(context) {
  let client;
  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);

    let locations = await db.collection("locations").find({}).toArray();

    return {
      props: {
        locations: JSON.stringify(locations)
      }
    }
  } catch(e) {
    console.error(e);
    console.log("Error occured");
    return {
      props: {
        locations: JSON.stringify([])
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }
}
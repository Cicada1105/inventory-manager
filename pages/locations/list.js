import Link from 'next/link'
import { useRouter } from 'next/router'
import mongoClient from '../../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'

export default function Locations({ locations, user }) {
  const userRestrictions = user.restrictions["locations"];
  // Check if user has create and update access
  const hasCreateAccess = userRestrictions.includes("create");
  const hasUpdateAccess = userRestrictions.includes('update');

  const routes = useRouter();

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">Locations</h1>
      <div className="w-fit m-auto my-4">
        <span className="mr-4 hover:underline">
          <Link href="/">Back</Link>
        </span>
        {
          hasCreateAccess && 
          <span className="hover:underline">
            <Link href="/locations/new">New Location</Link>
          </span>
        }
      </div>
      <table className="m-auto mt-8 text-center" style={{color:"white"}}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            {
              hasUpdateAccess &&
              <th></th>
            }
          </tr>
        </thead>
        <tbody>
        {
          JSON.parse(locations).map((location,i) => {
            return (
              <tr key={i}>
                <td>{location.name}</td>
                <td>{location.description}</td>
                {
                  hasUpdateAccess && 
                  <td>
                    <FontAwesomeIcon onClick={() => routes.push(`/locations/update?id=${location._id}`)} icon={faPenToSquare} />
                  </td>
                }
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
  let { req } = context;
  
  // Store user data
  let user = req.session.user;

  let client;
  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);

    let locations = await db.collection("locations").find({}).toArray();

    return {
      props: {
        locations: JSON.stringify(locations),
        user
      }
    }
  } catch(e) {
    console.error(e);
    console.log("Error occured");
    return {
      props: {
        locations: JSON.stringify([]),
        user
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }
});
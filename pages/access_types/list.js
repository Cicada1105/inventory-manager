import { useState, useEffect } from 'react'
import Link from 'next/link'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faX } from '@fortawesome/free-solid-svg-icons'

import mongoClient from '../../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'

import { CustomTable } from '../../components/index.js'

export default function Users({ types, user }) {
  const userRestrictions = user.restrictions["access_types"];
  // Check if user has create and update access
  const hasCreateAccess = userRestrictions.includes("create");
  const hasUpdateAccess = userRestrictions.includes('update');
  const hasDeleteAccess = userRestrictions.includes('delete');

  const [tableContent, setTableContent] = useState([]);

  useEffect(() => {
    let updatedTypes = JSON.parse(types).map((type,i) => {
      let obj = {
        name: type["name"]
      };

      Object.keys(type["restrictions"]).map((page,i) => 
        obj[page] = type["restrictions"][page].length === 0 ?
          "No Access" :
          type["restrictions"][page].join(", ")
      )

      if (hasUpdateAccess || hasDeleteAccess) {
        obj["controls"] = (
          <>
            {
              hasUpdateAccess && 
              <Link href={`/access_types/update/${type["_id"].toString()}`}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </Link>
            }
            {
              hasDeleteAccess && <FontAwesomeIcon icon={faX} />
            }
          </>
        )
      }

      return obj;
    });
    
    setTableContent(updatedTypes);
  }, []);

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">Access Types</h1>
      <div className="w-fit m-auto my-4">
        <span className="mr-4 hover:underline">
          <Link href="/">Back</Link>
        </span>
        {
          hasCreateAccess && 
          <span className="hover:underline">
            <Link href="/access_types/new">New Access Type</Link>
          </span>
        }
      </div>
      {
        (JSON.parse(types).length !== 0 && tableContent.length === 0) ?
        <h2 className="text-center">Loading...</h2> :
        <CustomTable title="Access Types" tableContent={tableContent} /> 
      }
    </>
  );
}

export const getServerSideProps = AuthenticateUser(async function(context) {
  let { req } = context;

  // Store user data
  let user = req.session["user"];

  let client;
  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);

    let types = await db.collection("access_types").find({}).toArray();

    return {
      props: {
        types: JSON.stringify(types),
        user
      }
    }
  } catch(e) {
    console.error(e);
    console.log("Error occured");
    return {
      props: {
        types: JSON.stringify([]),
        user
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }
});
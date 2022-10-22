import { useEffect, useState } from 'react'
import Link from 'next/link'

import mongoClient from '../../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'

import { CustomTable } from '../../components/index.js'

export default function Inventory({ items, user }) { 
  const userRestrictions = user.restrictions["inventory"];
  // Check if user has special create and read access
  const hasCreateAccess = userRestrictions.includes("create");
  const hasHigherReadAccess = userRestrictions.includes("read");
  
  const [tableContent, setTableContent] = useState([]);

  useEffect(() => {
    let updatedItems = JSON.parse(items).map((item,i) => {
      let obj = {
        name: item["name"],
        brand: item["brand"]
      };

      if (hasHigherReadAccess) {
        obj["quantity"] = item["quantity"];
        obj["location"] = item.location[0]["name"];
      }

      obj["description"] = item["description"];

      return obj;
    });
    
    setTableContent(updatedItems);
  }, []);
  
  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">
        Inventory
      </h1>
      <div className="w-fit m-auto my-4">
        <span className="mr-4 hover:underline">
          <Link href="/">Back</Link>
        </span>
        {
          hasCreateAccess && 
          <span className="hover:underline">
            <Link href="/inventory/new">New Stock</Link>
          </span>
        }
      </div>
      {
        (JSON.parse(items).length !== 0 && tableContent.length === 0) ?
        <h2 className="text-center">Loading...</h2> :
        <CustomTable title="Inventory" tableContent={tableContent} /> 
      }
    </>
  );
}

export const getServerSideProps = AuthenticateUser(async function (context) {
  let { req } = context;
  
  // Store user data
  let user = req.session.user;

  let client;
  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);

    let inventory = await db.collection("inventory").aggregate([{
      $lookup: {
        from:"locations",
        localField:"location_id",
        foreignField:"_id",
        as:"location"
      }
    }]).toArray();

    return {
      props: {
        items: JSON.stringify(inventory),
        user
      }
    }
  } catch(e) {
    console.error(e);
    console.log("Error occured");
    return {
      props: {
        items: JSON.stringify([]),
        user
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }
});
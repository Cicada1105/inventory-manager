import Link from 'next/link'
import { useState } from 'react'

import mongoClient, { ObjectId } from '../../../utils/mongodb.js'
import AuthenticateUser from '../../../utils/auth.js'
import { formatTitle } from '../../../utils/formatting.js'

export default function UpdateUser({ accessType, collectionNames }) {
  const [type, setType] = useState(JSON.parse(accessType));

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">Update Access Type</h1>
      <div className="w-fit m-auto my-4 hover:underline">
        <Link href="/access_types/list">Back</Link>
      </div>
      <section className="w-fit m-auto mb-8 border-solid border-2 border-white p-8">
        <form action={`/access_types/update/${type["_id"]}`}>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="accessName" className="inline">Access Name:</label>
            <input id="accessName" type="text" name="name" defaultValue={ type["name"] } />
          </div>
          {
            JSON.parse(collectionNames).map((name, i) => {
              // Retrieve access type restriction for current "page"/collection
              let currCollectionRestriction = type.restrictions[name];

              return (
                <div key={i}>
                  <h2 className="pb-4 underline">{ formatTitle(name) }</h2>
                  <div className="flex justify-between mb-8">
                    <div>
                      <input 
                        id={ "create_".concat(name) } className="mr-2" 
                        type="checkbox" name={ name } value="create" 
                        defaultChecked={currCollectionRestriction.includes("create")}
                      />
                      <label htmlFor={ "create_".concat(name) }>Create</label>
                    </div>
                    <div>
                      <input 
                        id={ "read_".concat(name) } className="mr-2" 
                        type="checkbox" name={ name } value="read" 
                        defaultChecked={currCollectionRestriction.includes("read")}
                      />
                      <label htmlFor={ "read_".concat(name) }>Read</label>
                    </div>
                    <div>
                      <input 
                        id={ "update_".concat(name) } className="mr-2" 
                        type="checkbox" name={ name } value="update" 
                        defaultChecked={currCollectionRestriction.includes("update")}
                      />
                      <label htmlFor={ "update_".concat(name) }>Update</label>
                    </div>
                    <div>
                      <input 
                        id={ "delete_".concat(name) } className="mr-2" 
                        type="checkbox" name={ name } value="delete" 
                        defaultChecked={currCollectionRestriction.includes("delete")}
                      />
                      <label htmlFor={ "delete_".concat(name) }>Delete</label>
                    </div>
                  </div>
                </div>
              );
            })
          }
          <input type="hidden" name="_id" value={type["_id"]} />
          <input className="block mx-auto py-1 pl-2.5 pr-3 border-solid border-2 border-white rounded hover:bg-white hover:text-black hover:cursor-pointer" type="submit" value="Update" />
        </form>
      </section>
    </>
  )
}

export const getServerSideProps = AuthenticateUser(async function(context) {
  let client;
  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);

    // Retrieve parameters
    let params = context.query;

    // Retrieve all collections for the current user to view
    let collections = await db.collections();
    let collectionNames = collections.map(collection => collection["collectionName"]);

    if (Object.keys(params).length === 1) { // Accessing page from "access_types/list" to update specific type
      // Retrieve id from parameters
      let { id } = params;

      // Retrieve the queried access type from the database
      let accessType = await db.collection("access_types").findOne({
        _id: new ObjectId(id)
      });

      return {
        props: {
          accessType: JSON.stringify(accessType),
          collectionNames: JSON.stringify(collectionNames)
        }
      }
    }
    else if (Object.keys(params).length > 1) { // User has submitted updated access type
      // Extract out the parameter (id) to retrieve the form submitted data
      let { id, ...formData } = params;

      // Build out new access object to be inserted into database
      let accessTypeObj = {};
      accessTypeObj["name"] = formData["name"];
      accessTypeObj["restrictions"] = {};
      // Loop through the collection names, adding the access types if available
      collectionNames.forEach(name => {
        if (formData[name])
          accessTypeObj["restrictions"][name] = typeof formData[name] === "string" ? [formData[name]] : formData[name];
        else
          accessTypeObj["restrictions"][name] = [];
      });

      // Update access type
      await db.collection("access_types").updateOne({
        _id: new ObjectId(formData["_id"])
      },{
        $set: accessTypeObj
      });
    }

    return {
      redirect: {
        destination: "/access_types/list"
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
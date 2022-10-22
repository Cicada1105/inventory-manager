import { useState, useEffect } from 'react'
import Link from 'next/link'

import mongoClient from '../../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'
import { formatTitle } from '../../utils/formatting.js'

export default function NewAccessType({types}) {
  const [prefersDarkTheme, setPrefersDarkTheme] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia("(prefers-color-scheme:dark");

    setPrefersDarkTheme(mediaQueryList["matches"]);

    let preferenceChangeListener = function(e) {
      setPrefersDarkTheme(e.matches);
    }
    // Add event listener to the media query
    mediaQueryList.addEventListener("change",preferenceChangeListener);

    // Remove event listener on cleanup
    return () => {
      mediaQueryList.removeEventListener("change",preferenceChangeListener);
    }
  },[]);

  return (
    <>
      <h1 className="text-center mt-3 mb-6 text-3xl font-bold underline">New Access Type</h1>
      <div className="w-fit m-auto my-4 hover:underline">
        <Link href="/access_types/list">Back</Link>
      </div>
      <section className="w-fit m-auto border-solid border-2 p-8" style={{ borderColor: (prefersDarkTheme ? "white" : "black") }}>
        <form>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="accessName" className="inline">Access Name:</label>
            <input id="accessName" type="text" name="name" />
          </div>
          {
            JSON.parse(types).map((type, i) => 
              <div key={i}>
                <h2 className="pb-4 underline">{ formatTitle(type) }</h2>
                <div className="flex justify-between mb-8">
                  <div>
                    <input id={ "create_".concat(type) } className="mr-2" type="checkbox" name={ type } value="create" />
                    <label htmlFor={ "create_".concat(type) }>Create</label>
                  </div>
                  <div>
                    <input id={ "read_".concat(type) } className="mr-2" type="checkbox" name={ type } value="read" />
                    <label htmlFor={ "read_".concat(type) }>Read</label>
                  </div>
                  <div>
                    <input id={ "update_".concat(type) } className="mr-2" type="checkbox" name={ type } value="update" />
                    <label htmlFor={ "update_".concat(type) }>Update</label>
                  </div>
                  <div>
                    <input id={ "delete_".concat(type) } className="mr-2" type="checkbox" name={ type } value="delete" />
                    <label htmlFor={ "delete_".concat(type) }>Delete</label>
                  </div>
                </div>
              </div>
            )
          }
          <input className="block mx-auto py-1 pl-2.5 pr-3 border-solid border-2 rounded" type="submit" value="Create" />
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
    // Retrieve all collections for the current user to view
    let collections = await db.collections();
    let collectionNames = collections.map(collection => collection["collectionName"]);

    if (Object.keys(context.query).length > 0) { // User has submitted new access type
      // Retrieve parameters
      let params = context.query;
      // Build out new access object to be inserted into database
      let accessTypeObj = {};
      accessTypeObj["name"] = params["name"];
      accessTypeObj["restrictions"] = {};
      // Loop through the collection names, adding the access types if available
      collectionNames.forEach(name => {
        if (params[name])
          accessTypeObj["restrictions"][name] = typeof params[name] === "string" ? [params[name]] : params[name];
        else
          accessTypeObj["restrictions"][name] = [];
      });

      // Insert new access type
      await db.collection("access_types").insertOne(accessTypeObj);

      return {
        redirect: {
          destination: "/access_types/list"
        }
      }
    }

    return {
      props: {
        types: JSON.stringify(collectionNames)
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
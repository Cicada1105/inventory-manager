import { useState, useEffect } from 'react'
import Link from 'next/link'

import mongoClient, { ObjectId } from '../../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'

export default function UpdateLocation({ location }) {
  const [prefersDarkTheme, setPrefersDarkTheme] = useState(false);
  const currLocation = JSON.parse(location);

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
      <h1 className="text-center mt-3 mb-6 text-3xl font-bold underline">Update Location</h1>
      <div className="w-fit m-auto my-4 hover:underline">
        <Link href="/locations/list">Back</Link>
      </div>
      <section className="w-fit m-auto border-solid border-2 p-8" style={{ borderColor: (prefersDarkTheme ? "white" : "black") }}>
        <form>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="locationName" className="inline">Name:</label>
            <input id="locationName" type="text" defaultValue={ currLocation?.name } name="name" />
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="locationDescription">Description:</label>
            <textarea id="locationDescription" name="description" defaultValue={ currLocation?.description }></textarea>
          </div>
          { currLocation && <input type="hidden" name="id" defaultValue={ currLocation["_id"] } /> }
          <input className="block mx-auto py-1 pl-2.5 pr-3 border-solid border-2 rounded" type="submit" value="Update" />
        </form>
      </section>
    </>
  )
}

export const getServerSideProps = AuthenticateUser(async function(context) {
  // Attempt to obtain form search parameters
  let params = context.query;

  let client;
  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);

    if (params.name) {
      await db.collection("locations").updateOne({
        _id: new ObjectId(params["id"])
      }, {
        $set: {
          name: params["name"],
          description: params["description"] 
        }
      });
    }
    else if (params.id) {
      let location = await db.collection("locations").findOne({
        _id: new ObjectId(params.id)
      });

      return {
        props: { location: JSON.stringify(location) }
      }
    }

    return {
      redirect: {
        destination: "/locations/list",
        permanent:false
      }
    }
  } catch(e) {
    console.error(e);
    console.log("Error occured");

    return {
      redirect: {
        destination: "/locations/list"
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }

  return { props: {} }
});
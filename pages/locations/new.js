import Link from 'next/link'
import mongoClient from '../../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'

export default function NewLocation() {
  return (
    <>
      <h1 className="text-center mt-3 mb-6 text-3xl font-bold underline">New Location</h1>
      <div className="w-fit m-auto my-4 hover:underline">
        <Link href="/locations/list">Back</Link>
      </div>
      <section className="w-fit m-auto border-solid border-2 border-white p-8">
        <form>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="locationName" className="inline">Name:</label>
            <input id="locationName" className="" type="text" name="name" />
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="locationDescription">Description:</label>
            <textarea id="locationDescription" name="description"></textarea>
          </div>
          <input className="block mx-auto py-1 pl-2.5 pr-3 border-solid border-2 border-white rounded hover:bg-white hover:text-black hover:cursor-pointer" type="submit" value="Add" />
        </form>
      </section>
    </>
  )
}

export const getServerSideProps = AuthenticateUser(async function(context) {
  // Attempt to obtain form search parameters
  let params = context.query;

  if (params.name) {
    let client;
    try {
      // Await the connection to the MongoDB URI
      client = await mongoClient.connect();

      let db = client.db(process.env.MONGODB_DB);
      
      await db.collection("locations").insertOne({
        name: params["name"],
        description: params["description"]
      });

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
          destination: "/locations/new"
        }
      }
    } finally {
      // End connection after closing of app or error
      await client.close();
    }
  }

  return { props: {} }
});
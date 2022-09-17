import Link from 'next/link'
import mongoClient, { ObjectId } from '../../utils/mongodb.js'

export default function NewStock({ locations }) {
  return (
    <>
      <h1 className="text-center mt-3 mb-6 text-3xl font-bold underline">New Stock</h1>
      <Link href="/inventory/list">Back</Link>
      <section className="w-fit m-auto border-solid border-2 border-white p-8">
        <form>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="stockName" className="inline">Stock Name:</label>
            <input id="stockName" type="text" name="name" />
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="stockBrand">Brand:</label>
            <input id="stockBrand" type="text" name="brand" />
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="stockQuantity">Quantity:</label>
            <input id="stockQuantity" type="number" name="quantity" min="0" />
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="stockLocation">Location:</label>
            <select id="stockLocation" name="location">
              <option value="" disabled>--Select Location--</option>
              {
                JSON.parse(locations).map((location, i) => <option key={i} value={location["_id"]}>{location["name"]}</option>)
              }
            </select>
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="stockDescription">Description:</label>
            <textarea id="stockDescription" type="text" name="description"></textarea>
          </div>
          <input className="block mx-auto py-1 pl-2.5 pr-3 border-solid border-2 border-white rounded hover:bg-white hover:text-black hover:cursor-pointer" type="submit" value="Add" />
        </form>
      </section>
    </>
  )
}

export async function getServerSideProps(context) {
  // Attempt to obtain form search parameters
  let params = context.query;

  let client;
  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);

    if (params.name) {
      await db.collection("stock").insertOne({
        name: params["name"],
        description: params["description"],
        brand: params["brand"],
        quantity: params["quantity"],
        location_id: new ObjectId(params["location"])
      });

      return {
        redirect: {
          destination: "/inventory/list",
          permanent:false
        }
      }
    }
    else {
      let locations = await db.collection("locations").find({}).toArray();

      return {
        props: { 
          locations: JSON.stringify(locations)
        }
      }
    }
  } catch(e) {
    console.error(e);
    console.log("Error occured");

    return {
      redirect: {
        destination: "/inventory/new"
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }

  return { props: {} }
}
import Link from 'next/link'
import mongoClient from '../utils/mongodb.js'

export default function Inventory({ items }) {

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">
        Inventory
      </h1>
      <Link href="/new-work-order">New Work Order</Link>
      <table style={{color:"white"}}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Quantity</th>
            <th>Location</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
        {
          JSON.parse(items).map((item,i) => {
            return (
              <tr key={i}>
                <td>{item.name}</td>
                <td>{item.brand}</td>
                <td>{item.quantity}</td>
                <td>{item.location[0]["name"]}</td>
                <td>{item.description}</td>
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

    let stock = await db.collection("stock").aggregate([{
      $lookup: {
        from:"locations",
        localField:"location_id",
        foreignField:"_id",
        as:"location"
      }
    }]).toArray();

    return {
      props: {
        items: JSON.stringify(stock)
      }
    }
  } catch(e) {
    console.error(e);
    console.log("Error occured");
    return {
      props: {
        items: JSON.stringify([])
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }
}
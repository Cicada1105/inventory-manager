import Link from 'next/link'
import mongoClient from '../../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'

export default function Inventory({ items, user }) { 
  const hasAccess = user.restrictions["inventory"].includes("read");
  
  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">
        Inventory
      </h1>
      <div className="w-fit m-auto my-4">
        <span className="mr-4 hover:underline">
          <Link href="/">Back</Link>
        </span>
        <span className="hover:underline">
          <Link href="/inventory/new">New Stock</Link>
        </span>
      </div>
      <table className="m-auto mt-8 text-center" style={{color:"white"}}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            {
              hasAccess && (
                <>
                  <th>Quantity</th>
                  <th>Location</th>
                </>
              )
            }
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
                {
                  hasAccess && (
                    <>
                      <td>{item.quantity}</td>
                      <td>{item.location[0]["name"]}</td>
                    </>
                  )
                }
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
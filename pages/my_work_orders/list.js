import Link from 'next/link'
import mongoClient, { ObjectId } from '../../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'

import CompleteOrders from './completed/'
import IncompleteOrders from './incomplete/'

export default function Users({ orders }) {
  const workOrders = JSON.parse(orders);
  const incompleteOrders = workOrders.filter(order => order.is_fulfilled === false);
  const completedOrders = workOrders.filter(order => order.is_fulfilled === true);

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">My Work Orders</h1>
      <div className="w-fit m-auto my-4 hover:underline">
        <Link href="/work_orders/new">New Work Order</Link>
      </div>
      <IncompleteOrders orders={ incompleteOrders } />
      <CompleteOrders orders={ completedOrders } />
    </>
  )
}

export const getServerSideProps = AuthenticateUser(async function(context) {
  let client;

  // Retrieve the request from the context
  let { req } = context;

  // Retrieve user from request
  let user = req.session["user"];

  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);

    let workOrders = await db.collection("work_orders").aggregate([
      {
        $match: { user_id: new ObjectId(user["_id"]) }
      },
      {
        $lookup: {
          from: "inventory",
          localField:"inventory_id",
          foreignField:"_id",
          as:"inventory"
        }
      }
    ]).toArray();

    return {
      props: {
        orders: JSON.stringify(workOrders)
      }
    }
  } catch(e) {
    console.error(e);
    console.log("Error occured");
    return {
      redirect: {
        destination: "/"
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }
});
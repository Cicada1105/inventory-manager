import React from 'react'
import Link from 'next/link'
import mongoClient from '../../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'

import { AllCompletedWorkOrders } from '../../components'
import { AllIncompleteWorkOrders } from '../../components'

export default function WorkOrders({ orders, user }) {
  const workOrders = JSON.parse(orders);
  const completedOrders = workOrders.filter(order => order.is_fulfilled === true);
  const incompleteOrders = workOrders.filter(order => order.is_fulfilled === false);

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">Work Orders</h1>
      <AllIncompleteWorkOrders orders={ incompleteOrders } user={user} />
      <AllCompletedWorkOrders orders={ completedOrders } user={user} />
    </>
  )
}

export const getServerSideProps = AuthenticateUser(async function(context) {
  let { req } = context;

  // Retrieve user from the session
  let user = req.session.user;

  let client;
  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);

    let workOrders = await db.collection("work_orders").aggregate([
      {
        $lookup: {
          from:"users",
          localField:"user_id",
          foreignField:"_id",
          as:"user"
        }
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
        orders: JSON.stringify(workOrders),
        user
      }
    }
  } catch(e) {
    console.error(e);
    console.log("Error occured");
    return {
      props: {
        orders: JSON.stringify([])
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }
});
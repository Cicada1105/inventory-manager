import React from 'react'
import Link from 'next/link'
import mongoClient from '../../utils/mongodb.js'

import CompleteOrders from './completed/'
import IncompleteOrders from './incomplete/'

export default function WorkOrders({ orders }) {
  const workOrders = JSON.parse(orders);
  const completedOrders = workOrders.filter(order => order.is_fulfilled === true);
  const incompleteOrders = workOrders.filter(order => order.is_fulfilled === false);

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">Work Orders</h1>
      <Link href="/work_orders/new">New Work Order</Link>
      <IncompleteOrders orders={ incompleteOrders } />
      <CompleteOrders orders={ completedOrders } />
    </>
  )
}

export async function getServerSideProps(context) {
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
          from: "stock",
          localField:"stock_id",
          foreignField:"_id",
          as:"stock"
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
      props: {
        orders: JSON.stringify([])
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }
}
import React, { useState } from 'react'
import Link from 'next/link'
import mongoClient from '../../utils/mongodb.js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faX } from '@fortawesome/free-solid-svg-icons'

import CompleteConfirmation from './CompleteConfirmation.js'
import DeleteConfirmation from './DeleteConfirmation.js'

export default function WorkOrders({ orders }) {
  const workOrders = JSON.parse(orders);
  // Filter out the completed and incomplete work orders of current employees
  const [completedOrders,setCompletedOrders] = useState(workOrders.filter(order => order.is_fulfilled === true));
  const [incompleteOrders,setIncompleteOrders] = useState(workOrders.filter(order => order.is_fulfilled === false));
  const [displayCompleteModal, setDisplayCompleteModal] = useState(false);
  const [displayDeleteModal, setDisplayDeleteModal] = useState(false);
  const [workOrder,setWorkOrder] = useState(null);

  function handleDisplayCompleteModal(id, user, item, num_items) {
    setDisplayCompleteModal(true);
    // Update current work order to be removed
    setWorkOrder({ id, user, item, num_items });
  }
  function handleRemoveCompleteModal() {
    setDisplayCompleteModal(false);
    setWorkOrder(null);
  }
  function handleDisplayDeleteModal(id, user, item, num_items) {
    // Update current display of modal
    setDisplayDeleteModal(true);
    // Update current work order to be removed
    setWorkOrder({ id, user, item, num_items });
  }
  function handleRemoveDeleteModal() {
    setDisplayDeleteModal(false);
    setWorkOrder(null);
  }

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">Work Orders</h1>
      <Link href="/work_orders/new">New Work Order</Link>
      <table className="text-center" style={{color:"white"}}>
        <caption>Incomplete Orders</caption>
        <thead>
          <tr>
            <th>Work Order Owner</th>
            <th>Item</th>
            <th>Quantity</th>
            <th>Priority</th>
            <th>Date Ordered</th>
            <th>Reason</th>
            <th>Control Order</th>
          </tr>
        </thead>
        <tbody>
        {
          incompleteOrders.map((order,i) => {
            return (
              <tr key={i}> 
                <td>{order["user"][0]["first_name"]} {order["user"][0]["last_name"]}</td>
                <td>{order["stock"][0]["name"]}</td>
                <td>{order.quantity_withdrawn}</td>
                <td>{order.priority}</td>
                <td>{(new Date(order.date_ordered)).toLocaleDateString()}</td>
                <td>{order.reason}</td>
                <td>
                  <span onClick={() => handleDisplayCompleteModal(order["_id"], order["user"][0]["first_name"], order["stock"][0]["name"], order["quantity_withdrawn"])}>
                    <FontAwesomeIcon className="hover:cursor-pointer" icon={faCheck} />
                  </span>
                </td>
              </tr>
            );
          })
        }
        </tbody>
      </table>
      <table className="text-center" style={{color:"white"}}>
        <caption>Completed Orders</caption>
        <thead>
          <tr>
            <th>Work Order Owner</th>
            <th>Item</th>
            <th>Quantity</th>
            <th>Priority</th>
            <th>Date Ordered</th>
            <th>Date Fulfilled</th>
            <th>Reason</th>
            <th>Control Order</th>
          </tr>
        </thead>
        <tbody>
        {
          completedOrders.map((order,i) => {
            return (
              <tr key={i}>
                <td>{order["user"][0]["first_name"]} {order["user"][0]["last_name"]}</td>
                <td>{order["stock"][0]["name"]}</td>
                <td>{order.quantity_withdrawn}</td>
                <td>{order.priority}</td>
                <td>{(new Date(order.date_ordered)).toLocaleDateString()}</td>
                <td>{(new Date(order.date_fulfilled)).toLocaleDateString()}</td>
                <td>{order.reason}</td>
                <td>
                  <span onClick={() => handleDisplayDeleteModal(order["_id"], order["user"][0]["first_name"], order["stock"][0]["name"], order["quantity_withdrawn"])}>
                    <FontAwesomeIcon icon={faX} className="hover:cursor-pointer" />
                  </span>
                </td>
              </tr>
            );
          })
        }
        </tbody>
      </table>
      {displayCompleteModal && <CompleteConfirmation workOrder={workOrder} onCancel={handleRemoveCompleteModal} />}
      {displayDeleteModal && <DeleteConfirmation workOrder={workOrder} onCancel={handleRemoveDeleteModal} />}
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
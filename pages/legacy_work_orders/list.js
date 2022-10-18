import React, { useState } from 'react'
import Link from 'next/link'
import mongoClient from '../../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'

import { DeleteConfirmation } from '../../components'

export default function WorkOrders({ orders }) {
  const legacyWorkOrders = JSON.parse(orders).sort(function(order1, order2) {
    // Sort by orders not fulfilled first
    if (order1["is_fulfilled"] && !order2["is_fulfilled"])
      return 1;
    // Sort from most recent to latest -> if order2 is greater than order1, swap values
    if (order2["date_ordered"] > order1["date_ordered"])
      return 1;
    // Account for if the dates are equal, sort by name
    if (order2["date_ordered"] === order1["date_ordered"])
      return order1["user_name"].localeCompare(order2["user_name"]);
  });
  // Filter out work orders that are of current employees (user_name does not exists and user is an array)
  const [workOrders, setWorkOrders] = useState(legacyWorkOrders);

  const [displayModal, setDisplayModal] = useState(false);
  const [removedWorkOrder,setRemovedWorkOrder] = useState(null);
  const [responseMsg, setResponseMsg] = useState(null);


  function handleDisplayModal(id, user, item, num_items) {
    setDisplayModal(true);
    setRemovedWorkOrder({ id, user, item, num_items });
  }
  function handleRemoveDisplayModal() {
    setDisplayModal(false);
    setRemovedWorkOrder(null);
  }

  function handleDeleteOrder(id) {
    fetch("/api/legacy_work_orders/delete", {
      method: 'POST',
      mode: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    }).then(resp => {
      resp.json().then(data => {
        if (resp.status === 200)
          setResponseMsg({ 
            msg: data["message"],
            isSuccess: true
          });
        else
          setResponseMsg({
            msg: data["message"],
            isSuccess: false
          })
      });
    }).catch(err => {
      console.log("error");
    }).finally(() => {
      // Response is done, remoe modal
      handleRemoveModal();
      // After some time, reset response message and refresh page
      setTimeout(() => {
        routes.push("/legacy_work_orders/list");
        setResponseMsg(null);
      }, 2500);
    })
  }

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">Legacy Work Orders</h1>
      <div className="w-fit m-auto my-4">
        <span className="mr-4 hover:underline">
          <Link href="/">Back</Link>
        </span>
        <span className="hover:underline">
          <Link href="/work_orders/list">Work Orders</Link>
        </span>
      </div>
      <table className="m-auto mt-8 text-center" style={{color:"white"}}>
        <caption>
          Legacy Orders
          {
            responseMsg && (
              <><br /><span className={ responseMsg["isSuccess"] ? "text-green-400" : "text-red-400" }>{ responseMsg["msg"] }</span></>
            )
          }
        </caption>
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
          legacyWorkOrders.map((order,i) => {
            return (
              <tr key={i}>
                <td>{order["user_name"]}</td>
                <td>{order["inventory"][0]["name"]}</td>
                <td>{order.quantity_withdrawn}</td>
                <td>{order.priority}</td>
                <td>{(new Date(order.date_ordered)).toLocaleDateString()}</td>
                <td>{order["is_fulfilled"] ? (new Date(order.date_fulfilled)).toLocaleDateString() : "Not fulfilled"}</td>
                <td>{order.reason}</td>
                <td>
                  <span onClick={() => handleDisplayModal(order["_id"], order["user_name"], order["stock"][0]["name"], order["quantity_withdrawn"])}>
                    <FontAwesomeIcon icon={faX} className="hover:cursor-pointer" />
                  </span>
                </td>
              </tr>
            );
          })
        }
        </tbody>
      </table>
      {
        displayModal && 
        <DeleteConfirmation workOrder={removedWorkOrder} controls={{ 
            onCancel: handleRemoveDisplayModal, onSubmit: handleDeleteOrder 
          }} 
        />
      }
    </>
  )
}

export const getServerSideProps = AuthenticateUser(async function (context) {
  let client;
  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);

    let workOrders = await db.collection("legacy_work_orders").aggregate([
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
      props: {
        orders: JSON.stringify([])
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }
});
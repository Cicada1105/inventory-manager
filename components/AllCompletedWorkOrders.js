import { useState } from 'react'
import { useRouter } from 'next/router'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'

import DeleteConfirmation from './popups/DeleteConfirmation.js'

export default function AllCompletedWorkOrders({ orders, user }) {
  const [displayModal, setDisplayModal] = useState(false);
  const [workOrder,setWorkOrder] = useState(null);
  const [responseMsg, setResponseMsg] = useState(null);

  const routes = useRouter();
  const hasAccess = user.access_type === "Super User";

  function handleDisplayModal(id, user, item, num_items) {
    // Update current display of modal
    setDisplayModal(true);
    // Update current work order to be removed
    setWorkOrder({ id, user, item, num_items });
  }
  function handleRemoveModal() {
    setDisplayModal(false);
    setWorkOrder(null);
  }

  function handleDeleteOrder(id) {
    fetch("/api/work_orders/delete", {
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
        routes.push("/work_orders/list");
        setResponseMsg(null);
      }, 2500);
    })
  }

  return (
    orders["length"] === 0 ? 
    <h2 className="my-8 text-center text-lg">No Completed Work Orders</h2> :
    <>
      <table className="m-auto mt-8 text-center" style={{color:"white"}}>
        <caption>
          Completed Orders
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
            {
              hasAccess && <th>Control Order</th>
            }
          </tr>
        </thead>
        <tbody>
        {
          orders.map((order,i) => {
            return (
              <tr key={i}>
                <td>{order["user"][0]["first_name"]} {order["user"][0]["last_name"]}</td>
                <td>{order["inventory"][0]["name"]}</td>
                <td>{order.quantity_withdrawn}</td>
                <td>{order.priority}</td>
                <td>{(new Date(order.date_ordered)).toLocaleDateString()}</td>
                <td>{(new Date(order.date_fulfilled)).toLocaleDateString()}</td>
                <td>{order.reason}</td>
                {
                  hasAccess && 
                  <td>
                    <span onClick={() => handleDisplayModal(order["_id"], order["user"][0]["first_name"], order["inventory"][0]["name"], order["quantity_withdrawn"])}>
                      <FontAwesomeIcon icon={faX} className="hover:cursor-pointer" />
                    </span>
                  </td>
                }
              </tr>
            );
          })
        }
        </tbody>
      </table>
      {displayModal && <DeleteConfirmation workOrder={workOrder} controls={{ onCancel: handleRemoveModal, onSubmit: () => handleDeleteOrder(workOrder["id"]) }} />}
    </>
  )
}
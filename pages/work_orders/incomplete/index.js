import { useState } from 'react'
import { useRouter } from 'next/router'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import CompleteConfirmation from '../components/CompleteConfirmation.js'

export default function IncompleteWorkOrders({ orders, user }) {
  const [displayModal, setDisplayModal] = useState(false);
  const [workOrder,setWorkOrder] = useState(null);
  const [responseMsg, setResponseMsg] = useState(null);

  const routes = useRouter();
  const hasAccess = user.access_type === "Admin";

  function handleDisplayModal(id, user, item, num_items) {
    setDisplayModal(true);
    // Update current work order to be removed
    setWorkOrder({ id, user, item, num_items });
  }
  function handleRemoveModal() {
    setDisplayModal(false);
    setWorkOrder(null);
  }
  function handleCompleteOrder(id) {
    fetch("/api/work_orders/complete", {
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
        else if (resp.status === 409) // 409 -> Conflict in the current state of the data -> insufficient inventory items to complete order
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
    <>
      <table className="m-auto mt-8 text-center" style={{color:"white"}}>
        <caption>
          Incomplete Orders
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
                <td>{order["stock"][0]["name"]}</td>
                <td>{order.quantity_withdrawn}</td>
                <td>{order.priority}</td>
                <td>{(new Date(order.date_ordered)).toLocaleDateString()}</td>
                <td>{order.reason}</td>
                {
                  hasAccess && 
                  <td>
                    <span onClick={() => handleDisplayModal(order["_id"], order["user"][0]["first_name"], order["stock"][0]["name"], order["quantity_withdrawn"])}>
                      <FontAwesomeIcon className="hover:cursor-pointer" icon={faCheck} />
                    </span>
                  </td>
                }
              </tr>
            );
          })
        }
        </tbody>
      </table>
      {displayModal && <CompleteConfirmation workOrder={workOrder} controls={{ onCancel: handleRemoveModal , onSubmit: () => handleCompleteOrder(workOrder["id"]) }} />}
    </>
  )
}
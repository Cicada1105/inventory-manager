import { useState } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import CompleteConfirmation from '../components/CompleteConfirmation.js'

export default function IncompleteWorkOrders({ orders }) {
  const [displayModal, setDisplayModal] = useState(false);
  const [workOrder,setWorkOrder] = useState(null);

  function handleDisplayModal(id, user, item, num_items) {
    setDisplayModal(true);
    // Update current work order to be removed
    setWorkOrder({ id, user, item, num_items });
  }
  function handleRemoveModal() {
    setDisplayModal(false);
    setWorkOrder(null);
  }

  return (
    <>
      <table className="m-auto mt-8 text-center" style={{color:"white"}}>
        <caption>Incomplete Work Orders</caption>
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
          orders.map((order,i) => {
            return (
              <tr key={i}> 
                <td>{order["user"][0]["first_name"]} {order["user"][0]["last_name"]}</td>
                <td>{order["stock"][0]["name"]}</td>
                <td>{order.quantity_withdrawn}</td>
                <td>{order.priority}</td>
                <td>{(new Date(order.date_ordered)).toLocaleDateString()}</td>
                <td>{order.reason}</td>
                <td>
                  <span onClick={() => handleDisplayModal(order["_id"], order["user"][0]["first_name"], order["stock"][0]["name"], order["quantity_withdrawn"])}>
                    <FontAwesomeIcon className="hover:cursor-pointer" icon={faCheck} />
                  </span>
                </td>
              </tr>
            );
          })
        }
        </tbody>
      </table>
      {displayModal && <CompleteConfirmation workOrder={workOrder} onCancel={handleRemoveModal} />}
    </>
  )
}
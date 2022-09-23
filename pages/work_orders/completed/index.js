import { useState } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'

import DeleteConfirmation from '../components/DeleteConfirmation.js'

export default function CompletedWorkOrders({ orders }) {
  const [displayModal, setDisplayModal] = useState(false);
  const [workOrder,setWorkOrder] = useState(null);

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

  return (
    <>
      <table className="m-auto mt-8 text-center" style={{color:"white"}}>
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
          orders.map((order,i) => {
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
                  <span onClick={() => handleDisplayModal(order["_id"], order["user"][0]["first_name"], order["stock"][0]["name"], order["quantity_withdrawn"])}>
                    <FontAwesomeIcon icon={faX} className="hover:cursor-pointer" />
                  </span>
                </td>
              </tr>
            );
          })
        }
        </tbody>
      </table>
      {displayModal && <DeleteConfirmation workOrder={workOrder} onCancel={handleRemoveModal} />}
    </>
  )
}
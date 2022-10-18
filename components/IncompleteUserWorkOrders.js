import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { faX } from '@fortawesome/free-solid-svg-icons'

export default function IncompleteUserWorkOrders({ orders }) {
  return (
    <>
      <table className="m-auto mt-8 text-center" style={{color:"white"}}>
        <caption className="mb-4">Incomplete Orders</caption>
        <thead>
          <tr>
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
                <td>{order["inventory"][0]["name"]}</td>
                <td>{order.quantity_withdrawn}</td>
                <td>{order.priority}</td>
                <td>{(new Date(order.date_ordered)).toLocaleDateString()}</td>
                <td>{order.reason}</td>
                <td>
                  <FontAwesomeIcon icon={faPenToSquare} className="mx-2 hover:cursor-pointer" />
                  <FontAwesomeIcon icon={faX} className="mx-2 hover:cursor-pointer" />
                </td>
              </tr>
            );
          })
        }
        </tbody>
      </table>
    </>
  )
}
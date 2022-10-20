export default function CompletedUserWorkOrders({ orders }) {
  return (
    orders["length"] === 0 ? 
    <h2 className="my-8 text-center text-lg">No Completed Work Orders</h2> :
    <table className="m-auto mt-8 text-center" style={{color:"white"}}>
      <caption className="mb-4">Completed Orders</caption>
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Priority</th>
          <th>Date Ordered</th>
          <th>Date Fulfilled</th>
          <th>Reason</th>
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
              <td>{(new Date(order.date_fulfilled)).toLocaleDateString()}</td>
              <td>{order.reason}</td>
            </tr>
          );
        })
      }
      </tbody>
    </table>
  )
}
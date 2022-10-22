import { useState, useEffect } from 'react'

import CustomTable from './CustomTable.js'

export default function CompletedUserWorkOrders({ orders }) {
  const [tableContent, setTableContent] = useState([]);

  useEffect(() => {
    let updatedOrders = orders.map((order,i) => {
      return {
        item: order["inventory"][0]["name"],
        quantity: order["quantity_withdrawn"],
        priority: order["priority"],
        date_ordered: (new Date(order.date_ordered)).toLocaleDateString(),
        date_fulfilled: (new Date(order.date_fulfilled)).toLocaleDateString(),
        reason: order["reason"]
      }
    });

    setTableContent(updatedOrders);
  }, []);

  return (
    (orders.length !== 0 && tableContent.length === 0) ?
    <h2 className="text-center">Loading...</h2> :
    <CustomTable title="Completed Orders" tableContent={tableContent} />
  )
}
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { faX } from '@fortawesome/free-solid-svg-icons'

import DeleteConfirmation from './popups/DeleteConfirmation.js'

import CustomTable from './CustomTable.js'

export default function IncompleteUserWorkOrders({ orders }) {
  const [displayModal, setDisplayModal] = useState(false);
  const [workOrder,setWorkOrder] = useState(null);
  const [responseMsg, setResponseMsg] = useState(null);

  const [tableContent, setTableContent] = useState([]);

  const routes = useRouter();

  function handleDisplayModal(id, item, num_items) {
    // Update current display of modal
    setDisplayModal(true);
    // Update current work order to be removed
    setWorkOrder({ id, user: "this", item, num_items }); // Output will ask if "Are you sure you want to delete 'this' request..."
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
      setResponseMsg({
        msg: "Error occurred. Try again later",
        isSuccess: false
      })
    }).finally(() => {
      // Response is done, remoe modal
      handleRemoveModal();
      // After some time, reset response message and refresh page
      setTimeout(() => {
        routes.push("/my_work_orders/list");
        setResponseMsg(null);
      }, 2500);
    });
  }

  useEffect(() => {
    let updatedOrders = orders.map((order,i) => {
      return {
        item: order["inventory"][0]["name"],
        quantity: order["quantity_withdrawn"],
        priority: order["priority"],
        date_ordered: (new Date(order.date_ordered)).toLocaleDateString(),
        reason: order["reason"],
        control_order: (          
          <>
            <span onClick={() => routes.push(`/my_work_orders/update/${order["_id"]}`)}>
              <FontAwesomeIcon icon={faPenToSquare} className="mx-2 hover:cursor-pointer" />
            </span>
            <span onClick={() => handleDisplayModal(order["_id"], order["inventory"][0]["name"], order["quantity_withdrawn"])}>
              <FontAwesomeIcon icon={faX} className="mx-2 hover:cursor-pointer" />
            </span>
          </>
        )
      };
    });

    setTableContent(updatedOrders);
  }, []);

  return (
    <>
      {
        (orders.length !== 0 && tableContent.length === 0) ?
        <h2 className="text-center">Loading...</h2> :
        <CustomTable title="Incomplete Orders" tableContent={tableContent} />
      }
      {displayModal && <DeleteConfirmation workOrder={workOrder} controls={{ onCancel: handleRemoveModal, onSubmit: () => handleDeleteOrder(workOrder["id"]) }} />}
    </>
    //{
    //  responseMsg && (
    //    <><br /><span className={ responseMsg["isSuccess"] ? "text-green-400" : "text-red-400" }>{ responseMsg["msg"] }</span></>
    //  )
    //}
  )
}
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import CompleteConfirmation from './popups/CompleteConfirmation.js'

import CustomTable from './CustomTable.js'

export default function AllIncompleteWorkOrders({ orders, user }) {
  const [displayModal, setDisplayModal] = useState(false);
  const [workOrder,setWorkOrder] = useState(null);
  const [responseMsg, setResponseMsg] = useState(null);

  const [tableContent, setTableContent] = useState([]);

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

  useEffect(() => {
    let updatedOrders = orders.map((order,i) => {
      let obj = {
        work_order_owner: order["user"][0]["first_name"].concat(" ", order["user"][0]["last_name"]),
        item: order["inventory"][0]["name"],
        quantity: order["quantity_withdrawn"],
        priority: order["priority"],
        date_ordered: (new Date(order.date_ordered)).toLocaleDateString(),
        reason: order["reason"]
      };

      hasAccess && (
        obj["control_order"] = (
          <span onClick={() => handleDisplayModal(order["_id"], order["user"][0]["first_name"], order["inventory"][0]["name"], order["quantity_withdrawn"])}>
            <FontAwesomeIcon className="hover:cursor-pointer" icon={faCheck} />
          </span>
        )
      );

      return obj;
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
      {displayModal && <CompleteConfirmation workOrder={workOrder} controls={{ onCancel: handleRemoveModal , onSubmit: () => handleCompleteOrder(workOrder["id"]) }} />}
    </>
    //{
    //  responseMsg && (
    //    <><br /><span className={ responseMsg["isSuccess"] ? "text-green-400" : "text-red-400" }>{ responseMsg["msg"] }</span></>
    //  )
    //}
  )
}
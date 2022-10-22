import { useState, useEffect } from 'react'
import Link from 'next/link'

import mongoClient, { ObjectId } from '../../../utils/mongodb.js'
import AuthenticateUser from '../../../utils/auth.js'

export default function UpdateMyWorkOrder({ workOrder, stock, user }) {
  const [prefersDarkTheme, setPrefersDarkTheme] = useState(false);
	const myWorkOrder = JSON.parse(workOrder);
	const items = JSON.parse(stock);

  useEffect(() => {
    const mediaQueryList = window.matchMedia("(prefers-color-scheme:dark");

    setPrefersDarkTheme(mediaQueryList["matches"]);

    let preferenceChangeListener = function(e) {
      setPrefersDarkTheme(e.matches);
    }
    // Add event listener to the media query
    mediaQueryList.addEventListener("change",preferenceChangeListener);

    // Remove event listener on cleanup
    return () => {
      mediaQueryList.removeEventListener("change",preferenceChangeListener);
    }
  },[]);

	function handleInputChange(e) {
		// Retrieve element that triggered input change
		let el = e.target;
		// Check if element is the range element
		if (el["name"] === "priority") {
		  // Set output element (next element sibling) to the range's value
		  el.nextElementSibling.value = el.value;
		}
	}
	return (
		<>
			<h1 className="text-center mt-3 mb-6 text-3xl font-bold underline">New Work Order</h1>
			<div className="w-fit m-auto my-4 hover:underline">
				<Link href="/my_work_orders/list">Back</Link>
			</div>
			<section className="w-fit m-auto border-solid border-2 p-8" style={{ borderColor: (prefersDarkTheme ? "white" : "black") }}>
				<form onInput={ handleInputChange }>
				  {
				    // Add inventory is meant only for Admins adding items to inventory
				    (user.access_type === "Admin") &&
				    <div className="flex justify-between gap-20 mb-8">
				      <label htmlFor="workOrderAddInventory" className="inline">Adding Inventory</label>
				      <input id="workOrderAddInventory" type="checkbox" name="add_inventory" defaultChecked={myWorkOrder["quantity_withdrawn"] < 0}/>
				    </div>
				  }
				  <div className="flex justify-between gap-20 mb-8">
				    <label htmlFor="workOrderItem">Item:</label>
				    <select id="workOrderItem" name="inventory_id" defaultValue={(items.filter(item => item["_id"] === myWorkOrder["inventory_id"]))[0]["_id"]}>
				      <option value="" disabled>--Select Item--</option>
				      {
				        items.map((item, i) => <option key={i} value={item["_id"]}>{item["name"]}</option>)
				      }
				    </select>
				  </div>
				  <div className="flex justify-between gap-20 mb-8">
				    <label htmlFor="workOrderQuantity">Quantity:</label>
					{/*For negative values (adding to inventory) ensure value displayed is always positive*/}
				    <input id="workOrderQuantity" type="number" name="quantity_withdrawn" min="1" defaultValue={Math.abs(myWorkOrder["quantity_withdrawn"])} required />
				  </div>
				  <div className="flex justify-between gap-20 mb-8">
				    <label htmlFor="workOrderPriority" className="inline">Priority:</label>
				    <input id="workOrderPriority" type="range" name="priority" min="1" max="10" defaultValue={myWorkOrder["priority"].toString()} />
				    <output htmlFor="workOrderPriority" name="priorityOutput">{myWorkOrder["priority"]}</output>
				  </div>
				  <div className="flex justify-between gap-20 mb-8">
				  	<label htmlFor="workOrderReason">Reason:</label>
				    <textarea id="workOrderReason" type="text" name="reason" defaultValue={myWorkOrder["reason"]} required></textarea>
				  </div>
				  <input type="hidden" name="_id" value={myWorkOrder["_id"]} />
				  <input className="block mx-auto py-1 pl-2.5 pr-3 border-solid border-2 rounded" type="submit" value="Update" />
				</form>
			</section>
		</>
	);
}

export const getServerSideProps = AuthenticateUser(async function(context) {
	let client;
	let params = context.query;

	// Retrieve the request object
	const { req } = context;

	// Retrieve the current logged in user
	const user = req.session["user"];

	try {
		// Await the connection to the MongoDB URI
		client = await mongoClient.connect();

		let db = client.db(process.env.MONGODB_DB);

		// Check if the user has submitted data 
		if (params["quantity_withdrawn"]) {
			// Extract out the submitted data, removing the initial id parameter and _id of object
			let { id, _id, ...updatedWorkOrder } = params;

			// Convert quantity value to an integer
			let parsedQuantity = parseInt(updatedWorkOrder["quantity_withdrawn"]);
			// Convert quantity value to a negative string integer if add inventory was checked
			let updatedQuantity = updatedWorkOrder["add_inventory"] ? ~parsedQuantity + 1 : parsedQuantity;

			// Build out updated work order to follow the same typings as the database
			let builtWorkOrder = {
				quantity_withdrawn: updatedQuantity,
				priority: parseInt(updatedWorkOrder["priority"]),
				reason: updatedWorkOrder["reason"],
				inventory_id: new ObjectId(updatedWorkOrder["inventory_id"]),
			}

			// Use the hidden "_id" input over the url "id" as it is slightly more secure
			await db.collection("work_orders").updateOne({
				_id: new ObjectId(_id)
			}, {
				$set: builtWorkOrder
			});
		}
		else {
			let myWorkOrder = await db.collection("work_orders").findOne({
				$and: [
					{ user_id: new ObjectId(user["_id"]) },
					{ _id: new ObjectId(params["id"]) }
				]
			});
      		let stock = await db.collection("inventory").find({}).toArray();

			return {
				props: {
			 		workOrder: JSON.stringify(myWorkOrder),
			    	stock: JSON.stringify(stock),
			    	user
			  	}
			}
		}

		return {
			redirect: {
				destination: "/my_work_orders/list"
			}
		}
	} catch(e) {
		console.error(e);
		console.log("Error occured");
		return {
		  redirect: {
		    destination: "/"
		  }
		}
	} finally {
		// End connection after closing of app or error
		await client.close();
	}
});
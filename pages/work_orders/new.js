import Link from 'next/link'
import mongoClient, { ObjectId } from '../../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'

export default function NewWorkOrder({ items, user }) {
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
      <Link href="/work_orders/list">Back</Link>
      <section className="w-fit m-auto border-solid border-2 border-white p-8">
        <form onInput={ handleInputChange }>
          {
            // Add inventory is meant only for Admins adding items to inventory
            (user.access_type === "Admin") &&
            <div className="flex justify-between gap-20 mb-8">
              <label htmlFor="workOrderAddInventory" className="inline">Adding Inventory</label>
              <input id="workOrderAddInventory" type="checkbox" name="add_inventory" />
            </div>
          }
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="workOrderItem">Item:</label>
            <select id="workOrderItem" name="item">
              <option value="" disabled>--Select Item--</option>
              {
                JSON.parse(items).map((item, i) => <option key={i} value={item["_id"]}>{item["name"]}</option>)
              }
            </select>
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="workOrderQuantity">Quantity:</label>
            <input id="workOrderQuantity" type="number" name="quantity" min="1" required />
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="workOrderPriority" className="inline">Priority:</label>
            <input id="workOrderPriority" type="range" name="priority" min="1" max="10" defaultValue="5" />
            <output htmlFor="workOrderPriority" name="priorityOutput">5</output>
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="workOrderReason">Reason:</label>
            <textarea id="workOrderReason" type="text" name="reason" required></textarea>
          </div>
          <input className="block mx-auto py-1 pl-2.5 pr-3 border-solid border-2 border-white rounded hover:bg-white hover:text-black hover:cursor-pointer" type="submit" value="Add" />
        </form>
      </section>
    </>
  )
}

export const getServerSideProps = AuthenticateUser(async function(context) {
  let { req } = context;

  // Retrieve user from the session
  let user = req.session.user;

  // Attempt to obtain form search parameters
  let params = context.query;

  let client;
  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);

    if (params["reason"]) {
      // Convert quantity value to an integer
      let parsedQuantity = parseInt(params["quantity"]);
      // Convert quantity value to a negative string integer if add inventory was checked
      let updatedQuantity = params["add_inventory"] ? ~parsedQuantity + 1 : parsedQuantity

      await db.collection("work_orders").insertOne({
        quantity_withdrawn: updatedQuantity,
        priority: params["priority"],
        reason: params["reason"],
        is_fulfilled: false,
        date_ordered: new Date(),
        user_id: new ObjectId("6327b871565477f77570facb"), // Replace with logged in user's id
        stock_id: new ObjectId(params["item"])
      });

      return {
        redirect: {
          destination: "/work_orders/list",
          permanent:false
        }
      }
    }
    else {
      let stock = await db.collection("stock").find({}).toArray();

      return {
        props: { 
          items: JSON.stringify(stock),
          user
        }
      }
    }
  } catch(e) {
    console.error(e);
    console.log("Error occured");

    return {
      redirect: {
        destination: "/work_orders/new",
        permanent:false
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }

  return { props: {} }
});
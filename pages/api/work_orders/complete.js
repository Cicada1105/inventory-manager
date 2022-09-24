// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import mongoClient, { ObjectId } from "../../../utils/mongodb.js"

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Retrieve the work order id from the body
    let { id } = req.body;

    let client;
    try {
      // Await the connection to the MongoDB URI
      client = await mongoClient.connect();

      let db = client.db(process.env.MONGODB_DB);

      /*
        The resulting query does the following:
        1. Locate the work order specifie by 'id'
        2. Left join the work order with the stock collection, storing the items that the work order references via "item"
        3. Turn the newly joined "item" array field into an object by creating an object for each item in the array 
            (in this case only one item -> the inventory item the work order references)
        4. Subtract the work order quantity_withdrawn from the quantity field of the "item" object
        5. Merge the value calculated in step 4. with the "item" object, ultimately overriding the old "quantity" field value
        6. Replace the current object (containing all of the work order data and the "item" field containing the item related to the work order)
            with the item itself 
      */
      let result = await db.collection("work_orders").aggregate([
        {
         $match: { _id: new ObjectId(id) } 
        },
        {
          $lookup: {
            from: "stock",
            localField: "stock_id",
            foreignField: "_id",
            as: "item"
          }
        },
        {
          $unwind: "$item"
        },
        {
          $replaceWith: {
            $mergeObjects: [
              "$item",
              {
                quantity: {
                  $subtract: [
                    {
                      $getField: {
                        field: "quantity",
                        input: "$item"
                      }
                    },
                    "$quantity_withdrawn"
                  ]
                }
              }
            ]
          }
        }
      ]).toArray();

      // Retrieve the newly updated item
      let updatedItem = result[0];

      // Check if result ends in a negative stock quantity -> insufficient items in the inventory
      if (updatedItem["quantity"] < 0)
        res.status(409).json({ message: "Insufficient items in inventory" });
      // Else, complete the order by updating the stock, changing the order to fulfilled and recording the date the order was fulfilled on
      else {
        // Update stock quantity
        await db.collection("stock").updateOne({
          _id: new ObjectId(updatedItem["_id"])
        }, {
          $set: {
            quantity: updatedItem["quantity"]
          }
        });
        // Change the work order to fulfilled and include what date it was completed on
        await db.collection("work_orders").updateOne({
          _id: new ObjectId(id)
        }, {
          $set: {
            is_fulfilled: true,
            date_fulfilled: new Date()
          }
        });

        res.status(200).json({ message: "Order has been completed!" }); 
      }
      //res.status(409).json({ message: "Insufficient items in inventory" });
    } catch(e) {
      console.error(e);
      console.log("Error occured");

      res.status(500).json({ message: "Server error occured" });
    } finally {
      // End connection after closing of app or error
      await client.close();
    }
  }
}
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import mongoClient, { ObjectId } from "../../../utils/mongodb.js"

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Retrieve the user id from the body
    let { id } = req.body;

    let client;
    try {
      // Await the connection to the MongoDB URI
      client = await mongoClient.connect();

      let db = client.db(process.env.MONGODB_DB); 

      // Join users collection with work orders, remove work orders, insert work orders into legacy collection

      // Query the users collection, obtaining user info
      let legacyWorkOrders = await db.collection("work_orders").aggregate([
        {
          $match: { user_id: new ObjectId(id) }
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user"
          }
        }, {
          $unset: "user_id"
        }, {
          $addFields: {
            user_name: {
              $concat: [
                {
                  $getField: {
                    field: "first_name",
                    input: {
                      $arrayElemAt: [ "$user", 0 ] 
                    }
                  }
                },
                " ",
                {
                  $getField: {
                    field: "last_name",
                    input: {
                      $arrayElemAt: [ "$user", 0 ]
                    }
                  }
                }
              ]
            }
          }
        }, {
          $unset: "user"
        }
      ]).toArray();

      // Insert legac work orders into legacy work orders collection
      await db.collection("legacy_work_orders").insertMany(legacyWorkOrders);

      // Remove work orders by the user
      await db.collection("work_orders").deleteMany({ user_id: new ObjectId(id) });

      // Remove user once legacy work orders have been added with user's name and user has been removed from user collection
      await db.collection("users").deleteOne({ _id: new ObjectId(id) });

      res.redirect(307,'/users/list');
    } catch(e) {
      console.error(e);
      console.log("Error occured");

      res.status(500).json({ err: "Error occured" });
    } finally {
      // End connection after closing of app or error
      await client.close();
    }
  }
}
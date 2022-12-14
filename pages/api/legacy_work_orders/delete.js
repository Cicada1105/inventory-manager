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

      let workOrders = await db.collection("legacy_work_orders").deleteOne({ _id: new ObjectId(id) });

      res.redirect(307,'/legacy_work_orders/list');
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
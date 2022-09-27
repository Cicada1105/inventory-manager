import { withIronSessionApiRoute } from "iron-session/next";
import { ironOptions } from '../../../utils/config.js'
import bcrypt from 'bcrypt'

import mongoClient, { ObjectId } from "../../../utils/mongodb.js"

export default withIronSessionApiRoute(
  async function authRoute(req, res) {
    // Authenticate the user
    let user = await AuthenticateMiddleware(req,res);
    // If returned successfully, store user into session
    req.session.user = user;

    // Save the session
    await req.session.save();
    // Redirect to home page
    res.redirect(307,"/");
  },
  ironOptions
);

async function AuthenticateMiddleware(req,res) {
  if (req.method === 'POST') {
    // Obtain username and password from the request body
    const { username, password } = req.body;

    let client;
    try {
      // Await the connection to the MongoDB URI
      client = await mongoClient.connect();

      let db = client.db(process.env.MONGODB_DB);

      // Query the user's collection for the username
      let user = await db.collection("users").findOne({ username });

      if (!user) // User does not exist, return to login
        res.redirect(307,"/login?err='Invalid login credentials'");
      // Compare password with wtored password
      else if (bcrypt.compareSync(password, user['password'])) { // Valid credentials
        // Query database for access type
        let accessType = await db.collection("access_types").findOne({
          _id: new ObjectId(user["access_type_id"])
        });

        // Remove unnecessary information from user data
        let { _id, password, date_registered, access_type_id, ...userInfo } = user;

        // Return object containing necessary user information
        return {
          access_type: accessType["name"],
          ...userInfo
        }
      }
      else  // Invalid password
        res.redirect(307, "/login?err='Invalid login credentials'");
    } catch(e) {
      console.error(e);
      console.log("Error occured");

      res.status(500).json({ err: "Error occured" });
    } finally {
      // End connection after closing of app or error
      await client.close();
    }
  }
  else {
    res.status(405).json({ err: `${req.method} not allowed` });
  }
}
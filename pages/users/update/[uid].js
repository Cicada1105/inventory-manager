import Link from 'next/link'
import { useState } from 'react'

import mongoClient from '../../../utils/mongodb'
import AuthenticateUser from '../../../utils/auth.js'

import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'

export default function UpdateUser({ accessTypes, user }) {
  const [userData, setUserData] = useState(JSON.parse(user));
  const [types, setTypes] = useState(JSON.parse(accessTypes));

  return (
    <>
      <h1 className="text-center mt-3 mb-6 text-3xl font-bold underline">Update User</h1>
      <div className="w-fit m-auto my-4 hover:underline">
        <Link href="/users/list">Back</Link>
      </div>
      <section className="w-fit m-auto border-solid border-2 border-white p-8">
        <form>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="userFName" className="inline">First Name:</label>
            <input id="userFName" className="" type="text" name="fname" defaultValue={ userData.first_name } required />
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="userLName" className="inline">Last Name:</label>
            <input id="userLName" className="" type="text" name="lname" defaultValue={ userData.last_name } required />
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="userName" className="inline">Username:</label>
            <input id="userName" className="" type="text" name="username" defaultValue={ userData.username } required />
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="userPass" className="inline">Password:</label>
            <input id="userPass" className="" type="password" name="password" />
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="userAccess">Access Type:</label>
            <select id="userAccess" name="access" defaultValue={types.filter(type => type["_id"] === userData["access_type_id"])[0]["_id"]}>
              <option value="" disabled>--Select Type--</option>
              {
                types.map((type, i) => <option key={i} value={type["_id"]}>{type["name"]}</option>)
              }
            </select>
          </div>
          <input type="hidden" name="_id" defaultValue={ userData["_id"].toString() } />
          <input className="block mx-auto py-1 pl-2.5 pr-3 border-solid border-2 border-white rounded hover:bg-white hover:text-black hover:cursor-pointer" type="submit" value="Update" />
        </form>
      </section>
    </>
  )
}

export const getServerSideProps = AuthenticateUser(async function(context) {
  let client;
  let params = context.query;

  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);

    // Check if user submitted any data
    if (params["fname"]) {
      // Create new user object 
      let userObj = {};
      // Only update password if it was set
      if (params["password"]) {
        const saltRounds = 12;

        // Generate the salt based on the number of desired rounds (10 is default)
        const salt = bcrypt.genSaltSync(saltRounds);
        // Hash password based on generated salt 
        const hash = bcrypt.hashSync(params["password"],salt);

        userObj["password"] = hash;
      }
      // Add additional fields
      userObj["first_name"] = params["fname"];
      userObj["last_name"] = params["lname"];
      userObj["username"] = params["username"];
      userObj["access_type_id"] = new ObjectId(params["access"]);

      // Insert new user into the database
      await db.collection("users").updateOne({
        _id: new ObjectId(params["_id"])
      }, {
        $set: userObj
      });

      // Redirect back to the list of users
      return {
        redirect: {
          destination:"/users/list",
          permanent:false
        }
      }
    }
    else {
      let types = await db.collection("access_types").find({}).toArray(); 
      // Retrieve user id and find user data
      let userID = params["uid"];
      let userData = await db.collection("users").findOne({
        _id: new ObjectId(userID)
      });

      return {
        props: {
          accessTypes: JSON.stringify(types),
          user: JSON.stringify(userData)
        } 
      }
    }
  } catch(e) {
    console.error(e);
    console.log("Error occured");

    return {
      redirect: {
        destination: "/users/list",
        permanent: false
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }

  return { props: {} }
});
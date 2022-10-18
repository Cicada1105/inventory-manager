import Link from 'next/link'
import mongoClient from '../../utils/mongodb'
import AuthenticateUser from '../../utils/auth.js'
import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'

export default function NewUser({ accessTypes }) {
  return (
    <>
      <h1 className="text-center mt-3 mb-6 text-3xl font-bold underline">New User</h1>
      <div className="w-fit m-auto my-4 hover:underline">
        <Link href="/users/list">Back</Link>
      </div>
      <section className="w-fit m-auto border-solid border-2 border-white p-8">
        <form>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="userFName" className="inline">First Name:</label>
            <input id="userFName" className="" type="text" name="fname" required />
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="userLName" className="inline">Last Name:</label>
            <input id="userLName" className="" type="text" name="lname" required />
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="userName" className="inline">Username:</label>
            <input id="userName" className="" type="text" name="username" required />
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="userPass" className="inline">Password:</label>
            <input id="userPass" className="" type="password" name="password" required />
          </div>
          <div className="flex justify-between gap-20 mb-8">
            <label htmlFor="userAccess">Access Type:</label>
            <select id="userAccess" name="access">
              <option value="" disabled>--Select Type--</option>
              {
                JSON.parse(accessTypes).map((type, i) => <option key={i} value={type["_id"]}>{type["name"]}</option>)
              }
            </select>
          </div>
          <input className="block mx-auto py-1 pl-2.5 pr-3 border-solid border-2 border-white rounded hover:bg-white hover:text-black hover:cursor-pointer" type="submit" value="Add" />
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

    if (params["fname"]) {
      const saltRounds = 12;

      // Generate the salt based on the number of desired rounds (10 is default)
      const salt = bcrypt.genSaltSync(saltRounds);
      // Hash password based on generated salt 
      const hash = bcrypt.hashSync(params["password"],salt);

      // Insert new user into the database
      await db.collection("users").insertOne({
        first_name: params["fname"],
        last_name: params["lname"],
        username: params["username"],
        password: hash,
        date_registered: new Date(),
        access_type_id: new ObjectId(params["access"])
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

      return {
        props: {
          accessTypes: JSON.stringify(types)
        } 
      }
    }
  } catch(e) {
    console.error(e);
    console.log("Error occured");

    return {
      redirect: {
        destination: "/users/new",
        permanent: false
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }

  return { props: {} }
});
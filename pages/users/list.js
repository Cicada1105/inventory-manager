import { useState } from 'react'
import Link from 'next/link'
import mongoClient from '../../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faX } from '@fortawesome/free-solid-svg-icons'

import ConfirmationPopup from './ConfirmationPopup.js'

export default function Users({ users }) {
  const [displayModal, setDisplayModal] = useState(false);
  const [removedUser,setRemovedUser] = useState(null);

  function handleDisplayModal(id, user_name) {
    setDisplayModal(true);
    setRemovedUser({ id, user_name });
  }
  function handleRemoveDisplayModal() {
    setDisplayModal(false);
    setRemovedUser(null);
  }
  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">Users</h1>
      <Link href="/users/new">New User</Link>
      <table style={{color:"white"}}>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
            <th>Access Type/Role</th>
            <th>Date Registered</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {
          JSON.parse(users).map((user,i) => {
            return (
              <tr key={i}>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.username}</td>
                <td>{user.access_type[0]["name"]}</td>
                <td>{(new Date(user.date_registered)).toLocaleDateString()}</td>
                <td>
                  <FontAwesomeIcon icon={faPenToSquare} />
                  <FontAwesomeIcon icon={faX} onClick={() => handleDisplayModal(user["_id"],user["first_name"].concat(" ",user["last_name"]))} />
                </td>
              </tr>
            );
          })
        }
        </tbody>
      </table>
      {displayModal && <ConfirmationPopup user={removedUser} onCancel={handleRemoveDisplayModal} />}
    </>
  )
}

export const getServerSideProps = AuthenticateUser(async function(context) {
  let client;
  try {
    // Await the connection to the MongoDB URI
    client = await mongoClient.connect();

    let db = client.db(process.env.MONGODB_DB);

    let users = await db.collection("users").aggregate([{
      $lookup: {
        from:"access_types",
        localField:"access_type_id",
        foreignField:"_id",
        as:"access_type"
      }
    }]).toArray();

    return {
      props: {
        users: JSON.stringify(users)
      }
    }
  } catch(e) {
    console.error(e);
    console.log("Error occured");
    return {
      props: {
        orders: JSON.stringify([])
      }
    }
  } finally {
    // End connection after closing of app or error
    await client.close();
  }
});
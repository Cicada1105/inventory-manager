import { useState, useEffect } from 'react'
import Link from 'next/link'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faX } from '@fortawesome/free-solid-svg-icons'

import mongoClient from '../../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'

import { RemoveUserPopup } from '../../components'

import { CustomTable } from '../../components/index.js'

export default function Users({ users }) {
  const [displayModal, setDisplayModal] = useState(false);
  const [removedUser,setRemovedUser] = useState(null);
  const [responseMsg, setResponseMsg] = useState(null);

  const [tableContent, setTableContent] = useState([]);

  function handleDisplayModal(id, user_name) {
    setDisplayModal(true);
    setRemovedUser({ id, user_name });
  }
  function handleRemoveDisplayModal() {
    setDisplayModal(false);
    setRemovedUser(null);
  }

  function handleDeleteUser(id) {
    fetch("/api/users/delete", {
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
        else
          setResponseMsg({
            msg: data["message"],
            isSuccess: false
          })
      });
    }).catch(err => {
      console.log("error");
    }).finally(() => {
      // Response is done, remoe modal
      handleRemoveDisplayModal();
      // After some time, reset response message and refresh page
      setTimeout(() => {
        routes.push("/users/list");
        setResponseMsg(null);
      }, 2500);
    })
  }

  useEffect(() => {
    let updatedItems = JSON.parse(users).map((user,i) => {
      return {
        first_name: user["first_name"],
        last_name: user["last_name"],
        username: user["username"],
        "access_type_/_role": user.access_type[0]["name"],
        date_registered: (new Date(user["date_registered"])).toLocaleDateString(),
        controls: (
          <>
            <Link href={`/users/update/${user["_id"].toString()}`}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </Link>
            <FontAwesomeIcon icon={faX} onClick={() => handleDisplayModal(user["_id"],user["first_name"].concat(" ",user["last_name"]))} />
          </>
        )
      };
    });
    
    setTableContent(updatedItems);
  }, []);

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">Users</h1>
      <div className="w-fit m-auto my-4">
        <span className="mr-4 hover:underline">
          <Link href="/">Back</Link>
        </span>
        <span className="hover:underline">
          <Link href="/users/new">New User</Link>
        </span>
      </div>
      {
        (JSON.parse(users).length !== 0 && tableContent.length === 0) ?
        <h2 className="text-center">Loading...</h2> :
        <CustomTable title="Users" tableContent={tableContent} /> 
      }
      {displayModal && <RemoveUserPopup user={removedUser} controls= {{ onCancel: handleRemoveDisplayModal, onSubmit: () => handleDeleteUser(removedUser["id"]) }} />}
    </>
  );
  // return (
  //   <>
  //     <h1 className="text-center mt-3 text-3xl font-bold underline">Users</h1>
  //     <div className="w-fit m-auto my-4">
  //       <span className="mr-4 hover:underline">
  //         <Link href="/">Back</Link>
  //       </span>
  //       <span className="hover:underline">
  //         <Link href="/users/new">New User</Link>
  //       </span>
  //     </div>
  //     <table className="m-auto mt-8 text-center" style={{color:"white"}}>
  //       <thead>
  //         <tr>
  //           <th>First Name</th>
  //           <th>Last Name</th>
  //           <th>Username</th>
  //           <th>Access Type/Role</th>
  //           <th>Date Registered</th>
  //           <th></th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //       {
  //         JSON.parse(users).map((user,i) => {
  //           return (
  //             <tr key={i}>
  //               <td>{user.first_name}</td>
  //               <td>{user.last_name}</td>
  //               <td>{user.username}</td>
  //               <td>{user.access_type[0]["name"]}</td>
  //               <td>{(new Date(user.date_registered)).toLocaleDateString()}</td>
  //               <td>
  //                 <Link href={`/users/update/${user["_id"].toString()}`}>
  //                   <FontAwesomeIcon icon={faPenToSquare} />
  //                 </Link>
  //                 <FontAwesomeIcon icon={faX} onClick={() => handleDisplayModal(user["_id"],user["first_name"].concat(" ",user["last_name"]))} />
  //               </td>
  //             </tr>
  //           );
  //         })
  //       }
  //       </tbody>
  //     </table>
  //     {displayModal && <RemoveUserPopup user={removedUser} onCancel={handleRemoveDisplayModal} />}
  //   </>
  // )
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
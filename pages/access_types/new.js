//import Link from 'next/link'
//import mongoClient from '../utils/mongodb.js'
import AuthenticateUser from '../../utils/auth.js'

export default function NewUser() {

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">New Access Type</h1>
    </>
  )
}

export const getServerSideProps = AuthenticateUser(async function(context) {
  return { props: {} }
});
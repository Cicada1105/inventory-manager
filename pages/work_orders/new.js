//import Link from 'next/link'
//import mongoClient from '../utils/mongodb.js'

export default function NewUser() {

  return (
    <>
      <h1 className="text-center mt-3 text-3xl font-bold underline">New Work Order</h1>
    </>
  )
}

export async function getServerSideProps(context) {
  return { props: {} }
}
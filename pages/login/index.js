import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Login({ err }) {
	return (
		<section className="border-2 border-white w-fit m-auto mt-8 py-8 px-12 text-center">
			<h1 className="pb-4">Login</h1>
	          {
	            err && (
	              <span className="block text-red-400">{ err }</span>
	            )
	          }
			<form className="w-80 m-auto mt-4" action="/api/login/auth" method="POST">
				<div className="flex justify-between mb-16">
					<label htmlFor="username_input">Username:</label>
					<input id="username_input" className="" type="text" name="username" />
				</div>
				<div className="flex justify-between mb-16">
					<label htmlFor="password_input">Password:</label>
					<input id="password_input" className="" type="password" name="password" />
				</div>
				<input className="m-auto py-1 px-2 border-2 border-white bg-black hover:bg-white hover:text-black" type="submit" value="Login" />
			</form>
		</section>
	);
}

export function getServerSideProps(context) {
	let params = context.query;

	return {
		props: params
	}
}
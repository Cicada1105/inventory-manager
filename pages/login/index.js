import { useState, useEffect } from 'react'

export default function Login({ err }) {
	const [prefersDarkTheme, setPrefersDarkTheme] = useState(false);

	useEffect(() => {
		const mediaQueryList = window.matchMedia("(prefers-color-scheme:dark");

		setPrefersDarkTheme(mediaQueryList["matches"]);

		let preferenceChangeListener = function(e) {
			setPrefersDarkTheme(e.matches);
		}
		// Add event listener to the media query
		mediaQueryList.addEventListener("change",preferenceChangeListener);

		// Remove event listener on cleanup
		return () => {
			mediaQueryList.removeEventListener("change",preferenceChangeListener);
		}
	},[]);

	return (
		<section className="border-2 w-fit m-auto mt-8 py-8 px-12 text-center" style={{ borderColor: (prefersDarkTheme ? "white" : "black") }}>
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
					<input id="password_input" type="password" name="password" />
				</div>
				<input 
					type="submit" value="Login" 
					className="m-auto py-1 px-2"
				/>
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
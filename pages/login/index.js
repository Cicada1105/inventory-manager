export default function Login() {
	return (
		<section className="border-2 border-white w-fit m-auto mt-8 py-8 px-12 text-center">
			<h1 className="pb-8">Login</h1>
			<form className="w-80 m-auto" action="/api/login/auth"method="POST">
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
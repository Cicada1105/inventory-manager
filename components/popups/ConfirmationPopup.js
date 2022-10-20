export default function ConfirmationPopup({ title, controls: { onCancel, onSubmit, btnText } }) {
	return (
		<div className="fixed top-0 w-screen h-screen">
			<div className="absolute bg-white opacity-75"></div>
			<div className="relative w-fit mx-auto mt-20 py-8 px-12 border-2 border-white bg-black">
				<h2 className="mb-10">{ title }</h2>
				<div className="flex justify-around gap-10">
					<button className="py-1 px-2 border-2 border-white bg-black hover:bg-white hover:text-black" onClick={ onCancel }>Cancel</button>
					<button className="py-1 px-2 border-2 border-white bg-black hover:bg-white hover:text-black" onClick={ onSubmit }>{ btnText }</button>
				</div>
			</div>
		</div>
	);
}
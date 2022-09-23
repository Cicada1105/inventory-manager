export default function ConfirmationPopup({ title, onCancel, submitPath, workOrderId }) {
	return (
		<div className="fixed top-0 w-screen h-screen">
			<div className="absolute bg-white opacity-75"></div>
			<div className="relative w-fit mx-auto mt-20 py-8 px-12 border-2 border-white bg-black">
				<h2 className="mb-10">{ title }</h2>
				<div className="flex justify-around gap-10">
					<button className="py-1 px-2 border-2 border-white bg-black hover:bg-white hover:text-black" onClick={ onCancel }>Cancel</button>
					<form method="POST" action={ submitPath } className="py-2 px-3 border-2 border-white bg-black hover:bg-white hover:text-black">
						<input type="hidden" name="id" value={ workOrderId } />
						<input type="submit" value="Delete" />
					</form>
				</div>
			</div>
		</div>
	);
}
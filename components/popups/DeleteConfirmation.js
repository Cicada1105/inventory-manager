import ConfirmationPopup from './ConfirmationPopup.js'

export default function DeleteConfirmation({workOrder: { id, user, item, num_items }, controls: { onCancel, onSubmit }}) {
	return (
		<ConfirmationPopup 
			title={`Are you sure you want to delete ${user}\'s request for ${num_items} ${item}${(num_items > 1) && "s"}`} 
			controls={{ onCancel, onSubmit, btnText: "Delete" }}
			workOrderId={id}
		/>
	);
}
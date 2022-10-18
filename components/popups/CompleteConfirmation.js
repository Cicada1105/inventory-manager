import ConfirmationPopup from './ConfirmationPopup.js'

export default function CompleteConfirmation({workOrder: { id, user, item, num_items }, controls: { onCancel, onSubmit }}) {
	return (
		<ConfirmationPopup 
			title={`Are you sure you want to complete ${user}\'s request for ${num_items} ${item}${(num_items > 1) && "s"}`} 
			controls={{ onCancel, onSubmit, btnText: "Complete" }}
			workOrderId={id}
		/>
	);
}
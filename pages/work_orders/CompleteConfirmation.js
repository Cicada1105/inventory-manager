import ConfirmationPopup from './ConfirmationPopup.js'

export default function CompleteConfirmation({workOrder: { id, user, item, num_items }, onCancel}) {
	return (
		<ConfirmationPopup 
			title={`Are you sure you want to complete ${user}'s request for ${num_items} ${item}${(num_items > 1) && "s"}`} 
			onCancel={onCancel}
			submitPath="/api/work_orders/complete"
			workOrderId={id}
		/>
	);
}
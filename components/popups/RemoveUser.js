export default function RemoveUserPopup({user: { user_name }, controls: { onCancel, onSubmit }}) {
	return (
		<ConfirmationPopup 
			title={`Are you sure you want to delete ${user_name} from the Inventory Management system?`} 
			controls={{ onCancel, onSubmit, btnText: "Delete" }}
		/>
	);
}
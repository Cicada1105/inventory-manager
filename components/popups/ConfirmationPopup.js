import { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

export default function ConfirmationPopup({ title, controls: { onCancel, onSubmit, btnText } }) {
	const [isOpen, setIsOpen] = useState(true);

	function handleClose() {
		setIsOpen(false);
		onCancel();
	}

	return (
		<Dialog open={isOpen} onClose={handleClose}>
	        <DialogContent>
	          <DialogContentText>{title}</DialogContentText>
	        </DialogContent>
	        <DialogActions>
	          <Button onClick={handleClose}>Cancel</Button>
	          <Button onClick={onSubmit} autoFocus>{btnText}</Button>
	        </DialogActions>
    	</Dialog>
    )
}
import Link from 'next/link'
import { useEffect, useState } from 'react'

import MUIDataTable from 'mui-datatables'
import { ThemeProvider, createTheme } from '@mui/material/styles'

import { formatTitle } from '../utils/formatting.js'

const tableOptions = {
	search: true,
	download: false,
	print: false, 
	filter: true,
	pagination:false,
	selectableRowsHeader: false,
	selectableRows: "none",
	filterType: "dropdown"
}
const customTheme = createTheme({
	components: {
		MuiTableHead: {
			styleOverrides: {
				root: {
				  '& .MuiTableCell-head > span': {
					 justifyContent: 'center'
				  },
				  '& .MuiTableCell-head button': {
					margin: 'auto'
				  },
				  '& .MuiButtonBase-root': {
					textTransform: "unset"
				  }
				}
			 }
		},
		MuiTableCell: {
			styleOverrides: {
				root: {
					textAlign: "center"
				}
			}
		}
	}
});

export default function CustomTable({ title, tableContent }) {
	const [headers, setHeaders] = useState([]);
	const [content, setContent] = useState([]);	

	useEffect(() => {
		let localHeaders = (tableContent.length > 0) ? Object.keys(tableContent[0]) : [];

		const formattedHeaders = localHeaders.map((header, i) => formatTitle(header));

		setHeaders( formattedHeaders);
	}, []);

	useEffect(() => {
		const content = tableContent.length > 0 ? tableContent.map((data,i) => 
			Object.values(data).map((cellData,i) => 
				cellData === null ? "" : (
					typeof cellData === "object" ?
					cellData :
					cellData.toString()
				)
			)
		): [[]];

		setContent(content);
	}, []);

	return (
		<ThemeProvider theme={customTheme}>
			<MUIDataTable
				className="mb-6 w-4/5 m-auto"
				title={title}
				columns={headers}
				data={content}
				options={tableOptions}
			/>
		</ThemeProvider>
	);
}
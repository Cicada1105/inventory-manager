import Link from 'next/link'

import { formatTitle } from '../utils/formatting.js'

export default function PagePreview({ name, page }) {
	let headers = (page.length > 0) ? Object.keys(page[0]) : [];
	// Remove all fields that have "id" in the title, password column and restrictions column removing respective columns
	let filteredHeaders = headers.filter(header => {
		if (header.includes("id") || header.includes("password") || header.includes('restrictions'))
			page.forEach(data => delete data[header]);
		else
			return header;
	});
	let colWidth = (page.length > 0) && (90 / filteredHeaders.length).toFixed(2);
	let linkStyling = page.length === 0 ? { marginLeft: "auto", marginRight: "auto" } : { marginLeft: "5%" };

	return (
		<>
			<h1 className="text-center mt-3 text-3xl font-bold underline">{ formatTitle(name) }</h1>
			<div className={`w-fit mb-4 hover:underline`} style={linkStyling}>
	  			<Link href={`/${name}/list`}>View More</Link>
			</div>
	  		{
	  			page.length === 0 ? 
	  			<h2 className="text-lg mt-4 mb-8 text-center">No { formatTitle(name) }</h2> :
	  			(
	  				<>
						<table className="table-fixed m-auto" style={{ width: "90%" }}>
							<thead>
							  <tr>
							  {
							  	filteredHeaders.map((header, i) => 
							  		<th key={i} style={{ width: `${colWidth}%` }}>{ formatTitle(header) }</th>
							  	)
							  }
							  </tr>
							</thead>
							<tbody>
							{
								(page.length > 0) && page.map((data,i) => 
									<tr key={i}>
										{
											Object.values(data).map((cellData,i) => <td key={i} className="break-words w-min">{
												cellData === null ? "" : cellData.toString()
											}</td>)
										}
									</tr>
								)
							}
							</tbody>
						</table>
					</>
	  			)
	  		}
		</>
	);
}